import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch attendance for this teacher only
    const attendance = await prisma.teacherAttendance.findMany({
  where: { teacherId: session.user.id },
  include: { markedBy: { select: { name: true, email: true } } },
  orderBy: { date: "desc" },
});

    // Calculate working days = total records
    const workingDays = attendance.length;

    return NextResponse.json({ attendance, workingDays });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
