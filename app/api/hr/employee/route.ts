import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
// GET: Fetch teachers with attendance for a specific date
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const employees = await prisma.user.findMany({
      where: { role: { notIn: ["ADMIN", "HR"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    return NextResponse.json({ employees })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 })
  }
}
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { name, email, role, department, employeeId, isActive } = await req.json()

    if (!name || !email || !role) {
      return NextResponse.json({ error: "Name, email, and role are required" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role,
        department: department || null,
        employeeId: employeeId || null,
        isActive: isActive ?? true,
        password: "", // or generate random password or handle separately
      },
    })

    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 })
  }
}