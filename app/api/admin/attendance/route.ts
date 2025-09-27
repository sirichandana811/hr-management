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
  // Security: Verify admin role
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const roleParam = url.searchParams.get("role");
  const dateParam = url.searchParams.get("date");

  // Input validation
  if (!roleParam) {
    return NextResponse.json({ error: "Missing role parameter" }, { status: 400 });
  }

  const allowedRoles = ["TEACHER", "HR"];
  const role = roleParam.toUpperCase() as "TEACHER" | "HR";
  
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ 
      error: "Invalid role. Allowed values: TEACHER, HR" 
    }, { status: 400 });
  }

  const date = toUTCDate(dateParam || "");

  try {
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
  } catch (error) {
    console.error("GET attendance error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error" 
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  // Security: Verify admin role
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let records: {
    teacherId: string;
    date: string;
    forenoon: string;
    afternoon: string;
    markedById: string;
    role: "TEACHER" | "HR";
  }[];

  try {
    records = await req.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  // Input validation
  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "Records array is required and cannot be empty" }, { status: 400 });
  }

  // Validate each record
  for (const record of records) {
    if (!record.teacherId || !record.date || !record.markedById) {
      return NextResponse.json({ 
        error: "Missing required fields: teacherId, date, markedById" 
      }, { status: 400 });
    }

    if (!["TEACHER", "HR"].includes(record.role)) {
      return NextResponse.json({ 
        error: "Invalid role. Allowed values: TEACHER, HR" 
      }, { status: 400 });
    }
  }

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
