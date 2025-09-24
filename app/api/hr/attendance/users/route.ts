import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const users = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, email: true, role: true, employeeId: true },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
