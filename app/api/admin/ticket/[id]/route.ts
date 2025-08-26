import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { status, priority } = await req.json();

    const updatedTicket = await prisma.SupportTicket.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        
      },
      include: {
        user: { select: { id: true, name: true, email: true } }, // ✅ keep user info
      },
    });

    return NextResponse.json(updatedTicket);
  } catch (err) {
    console.error("Ticket update error:", err);
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
