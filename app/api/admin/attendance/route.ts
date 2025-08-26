import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { after } from "node:test";

export async function POST(req: Request) {
  try {
    const { teacherId, date, forenoon, afternoon, markedById } = await req.json();

    if (!teacherId || !date || !forenoon || !afternoon || !markedById) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const attendance = await prisma.teacherAttendance.upsert({
      where: {
        teacherId_date: {
          teacherId,
          date: new Date(date),
        },
      },
      update: { forenoon, afternoon, markedById },
      create: {
        teacherId,
        date: new Date(date),
        forenoon,
        afternoon,
        markedById,
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
import { NextRequest } from "next/server";


// GET: Fetch teachers with attendance for a specific date
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const teacherId = searchParams.get("teacherId");

  const date = dateParam ? new Date(dateParam) : new Date();

  if (teacherId) {
    // Fetch attendance for one teacher
    const record = await prisma.teacherAttendance.findUnique({
      where: {
        teacherId_date: {
          teacherId,
          date,
        },
      },
    });
    return NextResponse.json(record || {});
  }

  // Fetch all teachers
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      teacherAttendance: {
        where: { date },
        select: {
          forenoon: true,
          afternoon: true,
          date: true,
        },
      },
    },
  });

  // Map attendance to each teacher
  const result = teachers.map((teacher) => ({
    ...teacher,
    attendance: teacher.teacherAttendance[0] || { forenoon: "", afternoon: "", date },
  }));

  return NextResponse.json(result);
}

// POST: Create or update attendance (upsert)
