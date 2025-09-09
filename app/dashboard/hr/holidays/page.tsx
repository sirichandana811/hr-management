"use client";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Holiday {
  id: string;
  name: string;
  date: string;
}

export default function HolidayCalendar() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const fetchHolidays = async () => {
    try {
      const res = await fetch("/api/holidays");
      setHolidays(await res.json());
    } catch (error) {
      console.error("Error fetching holidays:", error);
    }
  };

  const addHoliday = async () => {
    if (loading) return;
    setLoading(true);
    if (!name || !date) {
      alert("Please fill in both fields.");
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  const deleteHoliday = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holiday?")) return;
    try {
      await fetch(`/api/holidays/${id}`, { method: "DELETE" });
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
            <Button onClick={addHoliday}>Add</Button>
          </div>
        </div>

        {/* Holiday Table */}
        {holidays.length === 0 ? (
          <p className="text-gray-500">No holidays found.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Holiday Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
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
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteHoliday(h.id)}
                    >
                      Delete
                    </Button>
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
