// app/api/leaves/apply/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateWorkingDays } from "@/lib/caluclateworkingdays";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, leaveTypeId, startDate, endDate, reason } = body;

    if (!userId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch leave type
    const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
    if (!leaveType) {
      return NextResponse.json({ error: "Invalid leave type" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // ✅ Check for duplicate/overlapping leave requests
    const existingLeave = await prisma.leaveRequest.findFirst({
      where: {
        userId,
        leaveTypeId,
        status: { notIn: ["REJECTED", "CANCELLED"] },
        OR: [
          {
            startDate: { lte: end },
            endDate: { gte: start },
          },
        ],
      },
    });

    if (existingLeave) {
      return NextResponse.json(
        { error: "You already applied for leave in this date range." },
        { status: 400 }
      );
    }

    // Calculate leave days excluding holidays
    const days = await calculateWorkingDays(start, end);

    // Fetch or create LeaveBalance for this user & leaveType
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

    // Check remaining balance
    if (days > leaveBalance.remaining) {
      return NextResponse.json(
        {
          error: `Not enough remaining leaves. You have ${leaveBalance.remaining} left.`,
        },
        { status: 400 }
      );
    }

    // Create leave request
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
      },
    });

    // Update LeaveBalance used and remaining
    await prisma.leaveBalance.update({
      where: { id: leaveBalance.id },
      data: {
        used: leaveBalance.used + days,
        remaining: leaveBalance.remaining - days,
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// ✅ Get user leave requests
export async function GET(req: Request) {
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
