// lib/calculateWorkingDays.ts
import { prisma } from "@/lib/prisma";

export async function calculateWorkingDays(startDate: Date, endDate: Date) {
  const holidays = await prisma.holiday.findMany({
    select: { date: true },
  });

  // ✅ Only keep holidays that are NOT weekends
  const holidaySet = new Set(
    holidays
      .filter((h) => {
        const d = new Date(h.date);
        const day = d.getDay();
        return day !== 0 && day !== 6; // exclude Sundays & Saturdays
      })
      .map((h) => h.date.toISOString().split("T")[0])
  );

  let days = 0;
  let current = new Date(startDate);

  while (current <= endDate) {
    const day = current.getDay(); // 0 = Sun, 6 = Sat
    const dateStr = current.toISOString().split("T")[0];

    if (day !== 0 && day !== 6 && !holidaySet.has(dateStr)) {
      days++;
    }

    current.setDate(current.getDate() + 1);
  }

  return days;
}
