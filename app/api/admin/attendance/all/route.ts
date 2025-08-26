import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust your import path

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "date query parameter is required" }, { status: 400 });
    }

    // Parse date and create range for that day
    const date = new Date(dateParam);
    const nextDay = new Date(date);
    nextDay.setDate(date.getDate() + 1);

    const attendance = await prisma.teacherAttendance.findMany({
      where: {
        date: {
          gte: date,
          lt: nextDay,
        },
      },
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
          },
        },
        markedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


// DELETE all attendance records of a given date


export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    if (!dateParam) {
      return NextResponse.json({ error: "Date is required" }, { status: 400 });
    }

    // Convert string (e.g. "2025-08-25") into Date object
    const date = new Date(dateParam);

    if (isNaN(date.getTime())) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Delete attendance records for that day
    const deleted = await prisma.teacherAttendance.deleteMany({
      where: {
        date: {
          gte: new Date(date.setHours(0, 0, 0, 0)), // start of the day
          lt: new Date(date.setHours(23, 59, 59, 999)), // end of the day
        },
      },
    });

    return NextResponse.json({ message: "Deleted successfully", count: deleted.count });
  } catch (error) {
    console.error("Error deleting attendance:", error);
    return NextResponse.json({ error: "Failed to delete attendance" }, { status: 500 });
  }
}
