// File: /app/api/admin/attendance/bulk/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema matching your TeacherAttendance model
const attendanceSchema = z.array(
  z.object({
    teacherId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    forenoon: z.enum(["Present", "Absent"]),
    afternoon: z.enum(["Present", "Absent"]),
    markedById: z.string().optional(),
    role: z.enum(["TEACHER", "HR"]).optional(),
  })
);

// Helper to convert YYYY-MM-DD to UTC Date
const toUTCDate = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00.000Z`);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Only Admin can mark attendance
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = attendanceSchema.safeParse(body);

    if (!parsed.success) {
      console.log("Validation errors:", parsed.error.format());
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const records = parsed.data;

    // Prepare upsert operations
    const ops = records.map((r) => {
      const dateUTC = toUTCDate(r.date);
      if (isNaN(dateUTC.getTime())) {
        throw new Error(`Invalid date received: ${r.date}`);
      }

      return prisma.teacherAttendance.upsert({
        where: {
          teacherId_date: { teacherId: r.teacherId, date: dateUTC },
        },
        update: {
          forenoon: r.forenoon,
          afternoon: r.afternoon,
          markedById: r.markedById || session.user.id,
          role: r.role,
        },
        create: {
          teacherId: r.teacherId,
          date: dateUTC,
          forenoon: r.forenoon,
          afternoon: r.afternoon,
          markedById: r.markedById || session.user.id,
          role: r.role,
        },
      });
    });

    await prisma.$transaction(ops);

    return NextResponse.json(
      { message: "Attendance saved/updated successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
