import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    // Fetch all leave requests with user info
    const leaves = await prisma.leaveRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });

    // Map to send necessary info to frontend
    const formatted = leaves.map((l) => ({
      id: l.id,
      userId: l.userId,
      userName: l.user?.name || "-",
      leaveTypeId: l.leaveTypeId,
      leaveTypeName: l.leaveTypeName || l.leaveType?.name || "-",
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      days: l.days,
      status: l.status,
      reason: l.reason || "-",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
