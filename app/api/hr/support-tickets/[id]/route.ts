import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.SupportTicket.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Ticket deleted" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 })
  }
}
