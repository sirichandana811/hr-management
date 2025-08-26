"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";

interface AttendanceRecord {
  id: string;
  date: string;
  forenoon: string;
  afternoon: string;
  teacher: {
    id: string;
    name: string;
    email: string;
    employeeId: string;
  };
  markedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AllAttendanceHistoryPage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!selectedDate) return;

    const fetchAttendance = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/attendance/all?date=${selectedDate}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setAttendance(data);
      } else {
        setAttendance([]);
      }
      setLoading(false);
    };

    fetchAttendance();
  }, [selectedDate]);

  const handleDeleteByDate = async () => {
    if (!selectedDate) {
      alert("Please select a date first!");
      return;
    }

    if (!confirm(`Are you sure you want to delete all attendance records for ${selectedDate}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/attendance/all?date=${selectedDate}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Attendance records deleted successfully.");
        setAttendance([]);
      } else {
        alert("Failed to delete attendance records.");
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      alert("An error occurred while deleting attendance.");
    }
  };

  return (
    <DashboardLayout title="All Attendance History">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">All Attendance History</h1>
          <Button onClick={() => router.back()}>Back</Button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <label className="font-semibold">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-1"
          />
          <Button variant="outline" onClick={() => setSelectedDate("")}>
            Clear
          </Button>
          <Button variant="destructive" onClick={handleDeleteByDate}>
            Delete by Date
          </Button>
        </div>

        {loading && <p>Loading attendance...</p>}

        {!loading && attendance.length === 0 && <p>No attendance found for this date.</p>}

        {attendance.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Forenoon</TableHead>
                <TableHead>Afternoon</TableHead>
                <TableHead>Marked By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                  <TableCell>{record.teacher.name}</TableCell>
                  <TableCell>{record.teacher.email}</TableCell>
                  <TableCell>{record.teacher.employeeId}</TableCell>
                  <TableCell>{record.forenoon}</TableCell>
                  <TableCell>{record.afternoon}</TableCell>
                  <TableCell>{record.markedBy?.name || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}
