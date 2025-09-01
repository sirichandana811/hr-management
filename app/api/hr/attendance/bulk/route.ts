import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Expect the UI to send YYYY-MM-DD
const attendanceSchema = z.array(
  z.object({
    teacherId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // e.g. "2025-09-01"
    forenoon: z.enum(["Present", "Absent", "Leave"]),
    afternoon: z.enum(["Present", "Absent", "Leave"]),
    markedById: z.string().min(1),
  })
);

// Normalize "YYYY-MM-DD" to start-of-day UTC Date
const toUTCDate = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00.000Z`);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = attendanceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const records = parsed.data;

    // If your Prisma model is `TeacherAttendance`, the Prisma client is `prisma.teacherAttendance`
    // If your model is `Attendance`, use `prisma.attendance` instead.
    const ops = records.map((r) => {
      const d = toUTCDate(r.date);
      if (isNaN(d.getTime())) {
        throw new Error(`Invalid date received: ${r.date}`);
      }

      return prisma.teacherAttendance.upsert({
        where: {
          // Composite unique on [teacherId, date]
          teacherId_date: { teacherId: r.teacherId, date: d },
        },
        update: {
          forenoon: r.forenoon,
          afternoon: r.afternoon,
          markedById: r.markedById,
        },
        create: {
          teacherId: r.teacherId,
          date: d,
          forenoon: r.forenoon,
          afternoon: r.afternoon,
          markedById: r.markedById,
        },
      });
    });

    await prisma.$transaction(ops);

    return NextResponse.json({ message: "Bulk attendance saved/updated" }, { status: 201 });
  } catch (error) {
    console.error("Bulk attendance error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
