import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { HOLIDAYS } from "@/constants/holidays";  // Make sure this is an array of YYYY-MM-DD strings

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
    const body = await req.json();

    // If no leaveId/action in request, return pending leaves (GET behavior inside POST)
    if (!body.leaveId && !body.action) {
      const leaves = await prisma.leave.findMany({
        where: { status: "PENDING" },
        include: { user: { select: { id: true, name: true } } },
      });

      const formatted = leaves.map((leave) => ({
        id: leave.id,
        userId: leave.userId,
        userName: leave.user?.name || "Unknown",
        type: leave.type,
        startDate: leave.startDate.toISOString(),
        endDate: leave.endDate.toISOString(),
        reason: leave.reason,
        status: leave.status,
      }));

      return NextResponse.json(formatted);
    }

    // Otherwise, handle approve/reject action
    const { leaveId, action } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const leave = await prisma.leave.findUnique({
      where: { id: leaveId },
      include: { user: true },
    });

    if (!leave) {
      return NextResponse.json({ error: "Leave not found" }, { status: 404 });
    }

    if (leave.status !== "PENDING") {
      return NextResponse.json({ error: "Leave already processed" }, { status: 400 });
    }

    if (action === "approve") {
      await prisma.leave.update({
        where: { id: leaveId },
        data: { status: "APPROVED" },
      });
      return NextResponse.json({ message: "Leave approved" }, { status: 200 });
    }

    if (action === "reject") {
       const holidayRecords = await prisma.holiday.findMany({
      select: { date: true },
    });
    const holidayDates = holidayRecords.map(h => new Date(h.date));
      const leaveDays = calculateWorkingDays(leave.startDate, leave.endDate,holidayDates);

      let usedKey = "";
      if (leave.type === "CASUAL") usedKey = "usedCL";
      else if (leave.type === "SICK") usedKey = "usedSL";
      else if (leave.type === "PAID") usedKey = "usedPL";

      await prisma.$transaction([
        prisma.leave.update({
          where: { id: leaveId },
          data: { status: "REJECTED" },
        }),
        prisma.user.update({
          where: { id: leave.userId },
          data: { [usedKey]: { decrement: leaveDays } },
        }),
      ]);

      return NextResponse.json({ message: "Leave rejected and balance restored" }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
