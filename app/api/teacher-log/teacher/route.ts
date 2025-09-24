import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if needed
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path if needed
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);  
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const teachers = await prisma.user.findMany({
      where: { role: "TEACHER" },
      select: { id: true, name: true, email: true , employeeId: true },
    });
    return NextResponse.json(teachers);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}