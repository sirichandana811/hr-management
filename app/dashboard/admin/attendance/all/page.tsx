"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select"; // 👈 searchable dropdown
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";

interface Teacher {
  id: string;
  name: string;
  email: string;
  employeeId: string;
}

interface AttendanceRecord {
  id: string;
  date: string;
  forenoon: string;
  afternoon: string;
  teacher: Teacher;
  markedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AllAttendanceHistoryPage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  // Fetch teacher list once
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/admin/teachers");
        const data = await res.json();
        if (Array.isArray(data)) setTeachers(data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch attendance
  const fetchAttendance = async () => {
    if (!startDate || !endDate) {
      setAttendance([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("startDate", startDate);
      params.append("endDate", endDate);

      if (selectedTeacher) {
        params.append("name", selectedTeacher.name);
        params.append("email", selectedTeacher.email);
      }

      const res = await fetch(`/api/admin/attendance/all?${params.toString()}`);
      const data = await res.json();

      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendance([]);
    }
    setLoading(false);
  };

  // Auto-fetch when filters change
  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate, selectedTeacher]);

  const handleDeleteByRange = async () => {
    if (!startDate || !endDate) {
      alert("Please select start and end dates first!");
      return;
    }

    const confirmMsg = selectedTeacher
      ? `Are you sure you want to delete attendance records for ${selectedTeacher.name} from ${startDate} to ${endDate}?`
      : `Are you sure you want to delete attendance records for ALL teachers from ${startDate} to ${endDate}?`;

    if (!confirm(confirmMsg)) return;

    try {
      const params = new URLSearchParams({ startDate, endDate });

      if (selectedTeacher) {
        params.append("name", selectedTeacher.name);
        params.append("email", selectedTeacher.email);
      }

      const res = await fetch(`/api/admin/attendance/all?${params.toString()}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Attendance records deleted successfully.");
        fetchAttendance();
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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">All Attendance History</h1>
          <Button onClick={() => router.push("/dashboard/hr")}>Back</Button>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <label className="font-semibold mr-2">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded p-1"
            />
          </div>

          <div className="flex items-center">
            <label className="font-semibold mr-2">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded p-1"
            />
          </div>

          <div className="flex items-center min-w-[250px] flex-1">
            <label className="font-semibold mr-2">Teacher:</label>
            <Select
              className="flex-1"
              options={teachers.map((t) => ({
                value: t.id,
                label: `${t.name} - ${t.email}`,
                ...t,
              }))}
              value={
                selectedTeacher
                  ? {
                      value: selectedTeacher.id,
                      label: `${selectedTeacher.name} - ${selectedTeacher.email}`,
                      ...selectedTeacher,
                    }
                  : null
              }
              onChange={(option) => setSelectedTeacher(option as Teacher)}
              isClearable
              placeholder="Search & select teacher..."
            />
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setStartDate("");
              setEndDate("");
              setSelectedTeacher(null);
              setAttendance([]);
            }}
          >
            Clear
          </Button>

          <Button variant="destructive" onClick={handleDeleteByRange}>
            Delete Range
          </Button>
        </div>

        {/* Results */}
        {!startDate || !endDate ? (
          <p className="text-gray-500">
            Please select a start and end date to view attendance.
          </p>
        ) : loading ? (
          <p>Loading attendance...</p>
        ) : attendance.length === 0 ? (
          <p>No attendance found for the selected range/teacher.</p>
        ) : (
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
                  <TableCell>
                    {new Date(record.date).toLocaleDateString()}
                  </TableCell>
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
