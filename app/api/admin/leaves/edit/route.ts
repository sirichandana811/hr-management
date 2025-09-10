// app/api/hr/leaves/edit/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leaveId, startDate, endDate, days } = body;

    if (!leaveId || !startDate || !endDate || !days) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    // Only pending leaves can be edited
    if (leave.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending leaves can be edited" },
        { status: 400 }
      );
    }

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days,
      },
    });

    return NextResponse.json(updatedLeave);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
