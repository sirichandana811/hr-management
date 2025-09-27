import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    // Since course model doesn't exist in schema, return mock response
    const course = {
      id: "mock-id",
      title,
      description,
      subject,
      creatorId: session.user.id,
      teacherId: session.user.id,
    };

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
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Since course model doesn't exist in schema, return empty array
    const courses: any[] = [];
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}