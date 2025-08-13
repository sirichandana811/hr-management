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

  const addHoliday = async () => {
    if (!name || !date) {
      alert("Please fill in both fields.");
      return;
    }
    try {
      await fetch("/api/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, date }),
      });
      setName("");
      setDate("");
      fetchHolidays();
    } catch (error) {
      console.error("Error adding holiday:", error);
    }
  };

  const deleteHoliday = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await fetch(`/api/holidays/${id}`, {
        method: "DELETE",
      });
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
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
        <div className="mb-6 p-4 border rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Add New Holiday</h2>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              placeholder="Holiday Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-2 rounded-md flex-1"
            />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded-md"
            />
            <button
              onClick={addHoliday}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Add
            </button>
          </div>
        </div>

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
                  <button
                    onClick={() => deleteHoliday(h.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
