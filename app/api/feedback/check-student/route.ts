import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { studentEmail } = await req.json();
    if (!studentEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const student = await prisma.student.findFirst({
      where: { email: studentEmail },
    });

    if (!student) {
      return NextResponse.json({ exists: false, message: "Student not found" });
    }

    return NextResponse.json({ exists: true, student });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
