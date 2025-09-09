import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // current logged-in HR
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {
      teacherId: userId, // Only this HR's attendance
      role: "HR",
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // Fetch HR attendance for this user
    const attendance = await prisma.teacherAttendance.findMany({
      where,
      include: { markedBy: { select: { id: true, name: true, email: true } } },
      orderBy: { date: "desc" },
    });

    const workingDays = attendance.length;

    return NextResponse.json({ attendance, workingDays });
  } catch (error) {
    console.error("Error fetching HR attendance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
