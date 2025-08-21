import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // your NextAuth config
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, subject } = body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        subject,
        // 🔹 replace with logged-in userId
        creatorId: session.user.id, // ✅ logged-in user automatically
        teacherId: session.user.id, // if teacher themselves
      },
    });

    return NextResponse.json(course);
  } catch (error: any) {
    console.error("❌ Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course", details: error.message },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      include: { teacher: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}