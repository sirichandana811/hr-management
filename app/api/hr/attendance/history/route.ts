import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET(req: NextRequest) {

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "HR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const dateParam = searchParams.get("date"); // optional: filter by date

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
    }

    // Get teacher info
    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, name: true, email: true, employeeId: true },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Build date filter if provided
    const whereClause: any = { teacherId };
    if (dateParam) {
      const date = new Date(dateParam);
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      whereClause.date = { gte: date, lt: nextDay };
    }

    // Get attendance records
    const attendance = await prisma.teacherAttendance.findMany({
      where: whereClause,
      include: {
        markedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ teacher, attendance });
  } catch (error) {
    console.error("Attendance history error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
