import { NextResponse } from "next/server"
import {prisma} from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    await prisma.supportTicket.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Ticket deleted" })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete ticket" }, { status: 500 })
  }
}
