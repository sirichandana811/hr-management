"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";

export default function AttendanceHistoryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const teacherId = searchParams.get("teacherId");

  const [history, setHistory] = useState<any[]>([]);
  const [teacher, setTeacher] = useState<any>(null);
  const [searchDate, setSearchDate] = useState<string>("");

  useEffect(() => {
    if (!teacherId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/hr/attendance/history?teacherId=${teacherId}`);
        const data = await res.json();

        // IMPORTANT: Set history from data.attendance
        setTeacher(data.teacher || null);
        setHistory(Array.isArray(data.attendance) ? data.attendance : []);
      } catch (err) {
        console.error(err);
        setHistory([]);
      }
    };

    fetchData();
  }, [teacherId]);

  const filteredHistory = searchDate
    ? history.filter((rec) => new Date(rec.date).toISOString().slice(0, 10) === searchDate)
    : history;

  const workingDays = new Set(
    filteredHistory
      .filter((rec) => rec.forenoon === "Present" || rec.afternoon === "Present")
      .map((rec) => new Date(rec.date).toDateString())
  ).size;

  return (
    <DashboardLayout title="Attendance History">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Attendance History</h1>
          <Button onClick={() => router.back()}>Back</Button>
        </div>

        {teacher && (
          <div className="mb-4 border p-4 rounded bg-gray-50">
            <p><strong>Name:</strong> {teacher.name}</p>
            <p><strong>Email:</strong> {teacher.email}</p>
            <p><strong>Employee ID:</strong> {teacher.employeeId}</p>
            <p><strong>Working Days:</strong> {workingDays}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="mr-2 font-semibold">Search by Date:</label>
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            className="border rounded p-1"
          />
          <button
            className="ml-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            onClick={() => setSearchDate("")}
          >
            Clear
          </button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Forenoon</TableHead>
              <TableHead>Afternoon</TableHead>
              <TableHead>Marked By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                <TableCell>{record.forenoon}</TableCell>
                <TableCell>{record.afternoon}</TableCell>
                <TableCell>{record.markedBy?.name || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
