import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leaveId, action } = body;

    if (!leaveId || !action) {
      return NextResponse.json({ error: "Missing leaveId or action" }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    let newStatus: "APPROVED" | "REJECTED" | "CANCELLED" = leave.status;

    if (action === "APPROVE" && leave.status === "PENDING") {
      // Approve without changing balance
      newStatus = "APPROVED";
    } 
    else if ((action === "REJECT" && leave.status === "PENDING") || 
             (action === "CANCEL" && leave.status === "APPROVED")) {
      // Reject or Cancel: restore balance
      newStatus = action === "REJECT" ? "REJECTED" : "CANCELLED";

      await prisma.leaveBalance.updateMany({
        where: { userId: leave.userId, leaveTypeId: leave.leaveTypeId },
        data: { used: { decrement: leave.days }, remaining: { increment: leave.days } },
      });
    } 
    else {
      return NextResponse.json({ error: "Invalid action or status" }, { status: 400 });
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: newStatus },
    });

    return NextResponse.json(updatedLeave);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
