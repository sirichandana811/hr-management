import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    const { leaveId } = await req.json();

    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: { user: true },
    });
    if (!leave) return NextResponse.json({ error: "Leave not found" }, { status: 404 });

    if (leave.status === "CANCELLED") {
      return NextResponse.json({ error: "Leave already cancelled" }, { status: 400 });
    }

    // Fetch holidays from DB
    const holidayRecords = await prisma.holiday.findMany({
      select: { date: true },
    });

    const holidayDates = holidayRecords.map(h => new Date(h.date));

    // Calculate working days excluding weekends and holidays
    const days = calculateWorkingDays(leave.startDate, leave.endDate, holidayDates);

    let usedKey = "";
    if (leave.type === "CASUAL") usedKey = "usedCL";
    else if (leave.type === "SICK") usedKey = "usedSL";
    else if (leave.type === "PAID") usedKey = "usedPL";

    // Restore leave balance
    await prisma.user.update({
      where: { id: leave.userId },
      data: { [usedKey]: { decrement: days } },
    });

    // Update leave status
    await prisma.leave.update({
      where: { id: leaveId },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(
      { message: "Leave cancelled and balance restored" },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
