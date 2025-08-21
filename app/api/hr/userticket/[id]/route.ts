import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";

// Update Ticket (status/priority)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, priority } = await req.json();

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status, priority },
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}
