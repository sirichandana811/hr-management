import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.teachingLog.findMany({
        where: { teacherId },
        include: {
          teacher: { select: { id: true, name: true, email: true, employeeId: true } },
        },
        orderBy: { date: "desc" },
        skip,
        take: limit,
      }),
      prisma.teachingLog.count({ where: { teacherId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({ logs, totalPages });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
