"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";

interface Holiday {
  id: string;
  name: string;
  date: string;
}

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

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

        {/* Add Holiday Form */}
        

        {/* Holiday List */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Upcoming Holidays</h2>
          {holidays.length === 0 ? (
            <p className="text-gray-500">No holidays found.</p>
          ) : (
            <ul className="space-y-2">
              {holidays.map((h) => (
                <li
                  key={h.id}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <span className="font-medium">{h.name}</span>{" "}
                    <span className="text-gray-600">
                      {new Date(h.date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                 
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
