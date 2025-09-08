import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import type { LeaveStatus } from "@prisma/client";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leaveId, action } = body;

    if (!leaveId || !action) {
      return NextResponse.json(
        { error: "Missing leaveId or action" },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveRequest.findUnique({
      where: { id: leaveId },
    });

    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    let newStatus: LeaveStatus = leave.status;

    // ✅ APPROVE
    if (action === "APPROVE" && leave.status === "PENDING") {
      const balance = await prisma.leaveBalance.findFirst({
        where: { userId: leave.userId, leaveTypeId: leave.leaveTypeId },
      });

      if (!balance) {
        return NextResponse.json(
          { error: "No leave balance found" },
          { status: 404 }
        );
      }

      if (balance.remaining < leave.days) {
        return NextResponse.json(
          {
            error: `Not enough leave balance. Remaining: ${balance.remaining}, Requested: ${leave.days}`,
          },
          { status: 400 }
        );
      }

      await prisma.leaveBalance.update({
        where: { id: balance.id },
        data: {
          used: { increment: leave.days },
          remaining: { decrement: leave.days },
        },
      });

      newStatus = "APPROVED";
    }

    // ✅ CANCEL (restore balance if already approved)
    else if (action === "CANCEL" && leave.status === "APPROVED") {
      await prisma.leaveBalance.updateMany({
        where: { userId: leave.userId, leaveTypeId: leave.leaveTypeId },
        data: {
          used: { decrement: leave.days },
          remaining: { increment: leave.days },
        },
      });
      newStatus = "CANCELLED";
    }

    // ✅ REJECT
    else if (action === "REJECT" && leave.status === "PENDING") {
      newStatus = "REJECTED";
    }

    // ❌ Invalid case
    else {
      return NextResponse.json(
        { error: "Invalid action or status" },
        { status: 400 }
      );
    }

    // ✅ Update leave status
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedLeave);
  } catch (err) {
    console.error("Error in leave PATCH:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
