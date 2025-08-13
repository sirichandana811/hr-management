import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

const toggleStatusSchema = z.object({
  isActive: z.boolean(),
})

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params
    const body = await request.json()
    const { isActive } = toggleStatusSchema.parse(body)

    // Prevent admin from deactivating themselves
    if (userId === session.user.id && !isActive) {
      return NextResponse.json({ error: "Cannot deactivate your own account" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
    })

    return NextResponse.json({ message: "User status updated successfully", user }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Toggle user status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
