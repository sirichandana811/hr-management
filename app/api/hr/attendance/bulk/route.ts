import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Input validation schema
const attendanceSchema = z.array(
  z.object({
    teacherId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
    forenoon: z.enum(["Present", "Absent", "Leave"]),
    afternoon: z.enum(["Present", "Absent", "Leave"]),
    markedById: z.string().min(1),
  })
);

// Normalize "YYYY-MM-DD" → UTC Date
const toUTCDate = (yyyyMmDd: string) => new Date(`${yyyyMmDd}T00:00:00.000Z`);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  // Only HR can mark attendance
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
    const MAX_RETRIES = 5;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const ops = records.map((r) => {
          const d = toUTCDate(r.date);
          if (isNaN(d.getTime())) {
            throw new Error(`Invalid date received: ${r.date}`);
          }

          return prisma.teacherAttendance.upsert({
            where: {
              teacherId_date: { teacherId: r.teacherId, date: d },
            },
            update: {
              forenoon: r.forenoon,
              afternoon: r.afternoon,
              markedById: r.markedById,
              updatedAt: new Date(),
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

        return NextResponse.json(
          { message: "Bulk attendance saved/updated" },
          { status: 201 }
        );
      } catch (err: any) {
        if (err.code === "P2034") {
          console.warn(
            `⚠️ Deadlock detected. Retrying attempt ${attempt}/${MAX_RETRIES}...`
          );
          await new Promise((res) =>
            setTimeout(res, 100 * Math.pow(2, attempt)) // exponential backoff
          );
          continue; // retry
        }
        console.error("❌ Bulk attendance error:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
      }
    }

    return NextResponse.json(
      { error: "Max retries reached. Could not save attendance." },
      { status: 500 }
    );
  } catch (error) {
    console.error("❌ Unexpected error in attendance bulk API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
