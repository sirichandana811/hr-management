import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const toUTCDate = (yyyyMmDd: string) => {
  if (!yyyyMmDd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) {
    const today = new Date();
    return new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
    );
  }
  const [year, month, day] = yyyyMmDd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const role = url.searchParams.get("role") as "TEACHER" | "HR";
  const dateParam = url.searchParams.get("date");
  const date = toUTCDate(dateParam || "");

  const users = await prisma.user.findMany({
    where: { role },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      teacherAttendance: {
        where: { date },
        select: { forenoon: true, afternoon: true, date: true },
      },
    },
  });

  const result = users.map((user) => ({
    ...user,
    attendance: user.teacherAttendance[0] || undefined,
  }));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records: {
    teacherId: string;
    date: string;
    forenoon: string;
    afternoon: string;
    markedById: string;
    role: "TEACHER" | "HR";
  }[] = await req.json();

  try {
    const ops = records.map((r) => {
      const date = toUTCDate(r.date);
      return prisma.teacherAttendance.upsert({
        where: { teacherId_date: { teacherId: r.teacherId, date } },
        create: {
          teacherId: r.teacherId,
          date,
          forenoon: r.forenoon,
          afternoon: r.afternoon,
          markedById: r.markedById,
          role:r.role
        },
        update: {
          forenoon: r.forenoon,
          afternoon: r.afternoon,
          markedById: r.markedById,
          role:r.role
        },
      });
    });

    const result = await prisma.$transaction(ops);
    return NextResponse.json({ message: "Attendance saved/updated", result });
  } catch (error) {
    console.error("Attendance Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
