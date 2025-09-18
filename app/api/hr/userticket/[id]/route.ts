import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Update Ticket (status/priority)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status, priority } = await req.json();
   const Id=  params.id;
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: Id },
      data: { status, priority },
      include: {
        user: true
      }
    });

    return NextResponse.json(updatedTicket);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}



// ✅ GET one ticket
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

// ✅ PATCH update sharedToAdmin (or other fields)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const Id= params.id;
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: Id },
      data: {
        sharedToAdmin: body.sharedToAdmin, // 👈 updates field
      },
    });

    return NextResponse.json(updatedTicket, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update ticket" }, { status: 500 });
  }
}

// ✅ DELETE one ticket
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.supportTicket.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Ticket deleted" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 });
  }
}

