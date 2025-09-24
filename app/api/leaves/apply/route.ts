// app/api/leaves/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateWorkingDays } from "@/lib/caluclateworkingdays";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const { userId, leaveTypeId, startDate, endDate, reason } = body;

    if (!userId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // ✅ Fetch leave type
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });
    if (!leaveType) {
      return NextResponse.json({ error: "Invalid leave type" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ✅ Check for duplicate/overlapping leave requests
    const existingLeave = await prisma.leaveRequest.findFirst({
  where: {
    userId,
    status: { notIn: ["REJECTED", "CANCELLED"] },
    startDate: { lte: end },
    endDate: { gte: start },
  },
});

    if (existingLeave) {
      return NextResponse.json(
        { error: "You already applied for leave in this date range." },
        { status: 400 }
      );
    }

    // ✅ Calculate leave days excluding holidays
    const days = await calculateWorkingDays(start, end);
    if (days <= 0) {
      return NextResponse.json(
        { error: "No working days in the selected date range." },
        { status: 400 }
      );
    }
    // ✅ Fetch or create LeaveBalance (but don’t update it yet)
    let leaveBalance = await prisma.leaveBalance.findFirst({
      where: { userId, leaveTypeId },
    });

    if (!leaveBalance) {
      leaveBalance = await prisma.leaveBalance.create({
        data: {
          userId,
          leaveTypeId,
          leaveTypeName: leaveType.name,
          used: 0,
          remaining: leaveType.limit,
        },
      });
    }

    // ✅ Check if user has enough remaining balance
    if (days > leaveBalance.remaining) {
      return NextResponse.json(
        {
          error: `Not enough remaining leaves. You have ${leaveBalance.remaining} left.`,
        },
        { status: 400 }
      );
    }

    // ✅ Create leave request (without reducing balance yet)
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId,
        leaveTypeId,
        leaveTypeName: leaveType.name,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: "PENDING",
        role: "TEACHER"
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (err) {
    console.error("Leave Apply Error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ✅ Get user leave requests
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const requests = await prisma.leaveRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(requests);
}
