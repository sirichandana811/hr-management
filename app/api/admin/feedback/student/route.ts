import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST: Bulk upload students (Delete old + Insert new)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { students, college: collegeName, year } = body;

    if (!students || !Array.isArray(students) || students.length === 0) {
      return NextResponse.json({ error: "No students provided" }, { status: 400 });
    }

    if (!collegeName || !year) {
      return NextResponse.json({ error: "College and Year are required" }, { status: 400 });
    }

    // 1. Upsert College (with composite unique constraint name+year in schema)
   
    const college = await prisma.college.upsert({
      where: {
        name_year: { name: collegeName, year },
      },
      update: {},
      create: {
        name: collegeName,
        year,
        userId: session.user.id,
      },
    });

    // 2. Delete old students for this college
    await prisma.student.deleteMany({
      where: { collegeId: college.id },
    });
    // 3. Insert fresh students
    const formatted = students.map((s: any) => ({
      email: s.email,
      name: s.name || "",
      collegeId: college.id,
    }));

    const created = await prisma.student.createMany({
      data: formatted,
    });

    return NextResponse.json(
      {
        message: `Replaced students for ${collegeName} (Year ${year})`,
        count: created.count,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error in bulk student upload:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// GET: Fetch all colleges + students
export async function GET() {
  try {
    const colleges = await prisma.college.findMany({
      include: {
        students: {
          select: { id: true, name: true, email: true },
          orderBy: { email: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(colleges, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching colleges:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    const { college, year } = await req.json();

    if (!college || !year) {
      return NextResponse.json(
        { error: "Missing college or year" },
        { status: 400 }
      );
    }
    const collegeData = await prisma.college.findUnique({
      where: { name_year: { name: college, year } },
    });
    if (!college) {
      return NextResponse.json({ error: "College not found" }, { status: 404 });
    }
    const deleted = await prisma.student.deleteMany({
      where: { collegeId: collegeData?.id },
    });
    await prisma.college.delete({
      where: { name_year: { name: college, year } },
    });
    return NextResponse.json({
      message: `Deleted ${deleted.count} students from ${college} - Year ${year}`,
      deleted,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete students" },
      { status: 500 }
    );
  }
}
