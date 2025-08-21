import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE a course
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const { id } = await params;
  try {
    await prisma.course.delete({
      where: { id: id },
    });
    return NextResponse.json({ message: "Course deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
// app/api/courses/[id]/route.ts
 // adjust path

// PUT /api/courses/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { title, description, subject } = body;

    if (!title || !description || !subject) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: params.id },
      data: {
        title,
        description,
        subject, // optional update
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Failed to update course" },
      { status: 500 }
    );
  }
}
