import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"

const updateRoleSchema = z.object({
  role: z.nativeEnum(UserRole),
  department: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { role, department } = updateRoleSchema.parse(body)

    // Update user role
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role,
        department,
      },
    })

    return NextResponse.json({ message: "Role updated successfully", role: user.role }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.errors }, { status: 400 })
    }

    console.error("Update role error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
