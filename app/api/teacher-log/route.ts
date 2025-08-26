import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if needed




export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherId = searchParams.get("teacherId");

    if (!teacherId) {
      return NextResponse.json({ error: "teacherId is required" }, { status: 400 });
    }

    const logs = await prisma.teachingLog.findMany({
      where: { teacherId },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(logs);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
