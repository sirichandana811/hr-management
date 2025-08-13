// Fixed holidays
export const FIXED_HOLIDAYS = [
  "2025-01-01", // New Year
  "2025-01-26", // Republic Day
  "2025-08-15", // Independence Day
  "2025-10-02", // Gandhi Jayanti
  "2025-12-25", // Christmas
];

// Function to generate all Sundays for a given year
export function getAllSundays(year: number) {
  const sundays: string[] = [];
  const date = new Date(year, 0, 1);
  while (date.getFullYear() === year) {
    if (date.getDay() === 0) { // Sunday
      sundays.push(date.toISOString().split("T")[0]);
    }
    date.setDate(date.getDate() + 1);
  }
  return sundays;
}

export const HOLIDAYS = [
  ...FIXED_HOLIDAYS,
  ...getAllSundays(2025)
];
