import { prisma } from "@/lib/prisma";
import { HOLIDAYS } from "@/constants/holidays";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function calculateWorkingDays(startDate: Date, endDate: Date, holidays: Date[]) {
  let count = 0;
  const current = new Date(startDate);

  // Remove duplicate holiday dates
  const uniqueHolidays = holidays.filter(
    (h, index, self) =>
      index === self.findIndex(d => d.toDateString() === h.toDateString())
  );

  while (current <= endDate) {
    const day = current.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6;
    const isHoliday = uniqueHolidays.some(h =>
      h.toDateString() === current.toDateString()
    );

    if (!isWeekend && !isHoliday) {
      count++;
    }

    current.setDate(current.getDate() + 1);
  }

  return count;
}


export async function POST(req: Request) {
  try {
    // Get the logged-in session
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "You must be logged in to apply for leave" }, { status: 401 });
    }

    // Get the actual user from DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { type, startDate, endDate, reason } = await req.json();

    const start = new Date(startDate);
    const end = new Date(endDate);

    // No past dates
    if (start < new Date(new Date().toDateString())) {
      return NextResponse.json({ error: "Cannot select past dates" }, { status: 400 });
    }

       const holidayRecords = await prisma.holiday.findMany({
      select: { date: true },
    });
    const holidayDates = holidayRecords.map(h => new Date(h.date));
    // Calculate leave days excluding holidays & Sundays
    const leaveDays = calculateWorkingDays(start, end, holidayDates);

    // Check balance
    let available = 0;
    let usedKey = "";
    if (type === "CASUAL") {
      available = user.maxCL - user.usedCL;
      usedKey = "usedCL";
    } else if (type === "SICK") {
      available = user.maxSL - user.usedSL;
      usedKey = "usedSL";
    } else if (type === "PAID") {
      available = user.maxPL - user.usedPL;
      usedKey = "usedPL";
    }

    if (leaveDays > available) {
      return NextResponse.json(
        { error: `Only ${available} days left for ${type} leave` },
        { status: 400 }
      );
    }

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        userId: user.id,
        type,
        startDate: start,
        endDate: end,
        reason,
      },
    });
    
    // Update user's used leaves
    await prisma.user.update({
      where: { id: user.id },
      data: { [usedKey]: { increment: leaveDays } },
      
    });

    return NextResponse.json({ message: "Leave applied successfully", leave }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
