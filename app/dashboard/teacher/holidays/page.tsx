"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface Holiday {
  id: string;
  name: string;
  date: string;
}

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/holidays");
      setHolidays(await res.json());
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  return (
    <DashboardLayout title="Holiday Calendar">
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Holiday Calendar</h1>

        {holidays.length === 0 ? (
          <p className="text-gray-500">No holidays found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {holidays.map((h, index) => (
                <TableRow key={h.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{h.name}</TableCell>
                  <TableCell>
                    {new Date(h.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}
