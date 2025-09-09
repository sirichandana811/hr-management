import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ GET /api/hr/attendance/all
// Query params: startDate, endDate, name, email
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    const where: any = {
      role: "TEACHER", // ✅ always fetch teacher attendance only
    };

    // ✅ Date range filter
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // ✅ Teacher filter
    if (name || email) {
      where.teacher = {};
      if (name) where.teacher.name = name;
      if (email) where.teacher.email = email;
    }

    const records = await prisma.teacherAttendance.findMany({
      where,
      include: {
        teacher: true,
        markedBy: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    return NextResponse.json(records, { status: 200 });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    );
  }
}

// ✅ DELETE /api/hr/attendance/all
// Body/query params: startDate, endDate, name, email
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const name = searchParams.get("name");
    const email = searchParams.get("email");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "Start and end date are required for deletion" },
        { status: 400 }
      );
    }

    const where: any = {
      role: "TEACHER", // ✅ always delete only teacher attendance
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    };

    if (name || email) {
      where.teacher = {};
      if (name) where.teacher.name = name;
      if (email) where.teacher.email = email;
    }

    // ✅ Delete many
    const deleted = await prisma.teacherAttendance.deleteMany({
      where,
    });

    return NextResponse.json(
      { message: "Deleted successfully", count: deleted.count },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json(
      { error: "Failed to delete attendance records" },
      { status: 500 }
    );
  }
}
