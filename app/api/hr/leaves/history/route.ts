import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET teacher leave history
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const leaves = await prisma.leaveRequest.findMany({

      where: { userId, role: "HR" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaves);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// PATCH to cancel a leave
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { leaveId, userId } = body;

    if (!leaveId || !userId)
      return NextResponse.json({ error: "Missing leaveId or userId" }, { status: 400 });

    const leave = await prisma.leaveRequest.findUnique({ where: { id: leaveId } });
    if (!leave) return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    if (leave.status !== "PENDING")
      return NextResponse.json({ error: "Only pending leaves can be cancelled" }, { status: 400 });

    // Update leave status to CANCELLED
    await prisma.leaveRequest.update({
      where: { id: leaveId },
      data: { status: "CANCELLED" },
    });

    // Restore balance
    
      ;
    

    return NextResponse.json({ message: "Leave cancelled successfully" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
