// app/api/hr/leaves/edit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH: Edit a leave request (pending and approved)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { leaveId, startDate, endDate, days } = body;

    if (!leaveId || !startDate || !endDate || !days) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const leave = await prisma.leaveRequest.findUnique({ 
      where: { id: leaveId },
      include: { user: true }
    });
    
    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    // Only pending and approved leaves can be edited
    if (leave.status !== "PENDING" && leave.status !== "APPROVED") {
      return NextResponse.json(
        { error: "Only pending and approved leaves can be edited" },
        { status: 400 }
      );
    }

    const newDays = parseInt(days);
    const oldDays = leave.days;
    const daysDifference = newDays - oldDays;

    // If leave was previously approved, we need to handle balance changes
    
      const balance = await prisma.leaveBalance.findFirst({
        where: { 
          userId: leave.userId, 
          leaveTypeId: leave.leaveTypeId 
        },
      });

      if (!balance) {
        return NextResponse.json(
          { error: "No leave balance found" },
          { status: 404 }
        );
      }

      // If reducing days, restore the difference to balance
      if (leave.status === "APPROVED") {
      if (daysDifference < 0) {
        const restoreDays = Math.abs(daysDifference);
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: { decrement: restoreDays },
            remaining: { increment: restoreDays },
          },
        });
      }
      // If increasing days, check if enough balance is available
      else if (daysDifference > 0) {
        if (balance.remaining < daysDifference) {
          return NextResponse.json(
            {
              error: `Not enough leave balance. Remaining: ${balance.remaining}, Additional days needed: ${daysDifference}`,
            },
            { status: 400 }
          );
        }

        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: { increment: daysDifference },
            remaining: { decrement: daysDifference },
          },
        });
      }
    }

    // Update the leave request
    if(leave.status==="PENDING"){
      if (newDays > balance.remaining){
         return NextResponse.json(
         {error : 'not enough leave balance'},{
          status:400
         } 
         )
      }
    }
    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: newDays,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Leave request updated successfully",
      leave: updatedLeave,
      balanceAdjusted: leave.status === "APPROVED"
    });
  } catch (error) {
    console.error("Error editing leave:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
