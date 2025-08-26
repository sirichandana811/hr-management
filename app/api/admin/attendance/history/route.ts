import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust if your prisma import path is different

// Type for TeacherAttendance with related markedBy
interface TeacherAttendanceWithMarkedBy {
  id: string;
  date: Date;
  forenoon: string;
  afternoon: string;
  teacherId: string;
  markedBy?: { id: string; name: string | null; email: string } | null;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const dateParam = searchParams.get("date");

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
    }

    const whereClause: any = { teacherId };
    if (dateParam) {
      const date = new Date(dateParam);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      whereClause.date = { gte: date, lt: nextDay };
    }

    const attendanceFromDb = await prisma.teacherAttendance.findMany({
      where: whereClause,
      include: {
        markedBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { date: "desc" },
    });

    // map with types
    const attendance: TeacherAttendanceWithMarkedBy[] = attendanceFromDb.map(
      (att) => ({
        id: att.id,
        date: att.date,
        forenoon: att.forenoon,
        afternoon: att.afternoon,
        teacherId: att.teacherId,
        markedBy: att.markedBy || null,
      })
    );

    return NextResponse.json(attendance);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

