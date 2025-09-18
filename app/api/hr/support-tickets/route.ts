import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { TicketPriority } from "@prisma/client"

const createTicketSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.nativeEnum(TicketPriority),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority } = createTicketSchema.parse(body)

    const ticket = await prisma.supportTicket.create({
  
      data: {
        title,
        description,
        priority,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ message: "Support ticket created successfully", ticket }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Create support ticket error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: session.user.id, // only show logged-in user tickets
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tickets);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}