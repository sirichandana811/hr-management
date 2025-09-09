"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";
import { format } from "date-fns";
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Prevent hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // ✅ Fetch teachers once
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/hr/teachers");
        const data = await res.json();
        if (Array.isArray(data)) setTeachers(data);
      } catch (err) {
        console.error("Error fetching teachers:", err);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Fetch attendance with filters
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
      const res = await fetch(`/api/hr/attendance/all?${params.toString()}`);
      const data = await res.json();
      setAttendance(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setAttendance([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
  }, [startDate, endDate, selectedTeacher]);

  // ✅ Delete by range
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
      const res = await fetch(`/api/hr/attendance/all?${params.toString()}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Attendance records deleted successfully.");
        fetchAttendance();
      } else {
        alert("Failed to delete attendance records.");
      }
    } catch (err) {
      console.error("Error deleting attendance:", err);
      alert("An error occurred while deleting attendance.");
    }
  };

  return (
    <DashboardLayout title="All Attendance History">
      {!mounted ? (
        <p className="p-6 text-gray-500">Loading...</p>
      ) : (
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">All Attendance History</h1>
            <Button onClick={() => router.push("/dashboard/hr")}>Back</Button>
          </div>

          {/* Filters */}
         {/* Filters */}
<div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
  <div>
    <label className="block text-sm mb-1">Start Date</label>
    <input
      type="date"
      value={startDate}
      onChange={(e) => setStartDate(e.target.value)}
      className="w-full border rounded p-2"
    />
  </div>

  <div>
    <label className="block text-sm mb-1">End Date</label>
    <input
      type="date"
      value={endDate}
      onChange={(e) => setEndDate(e.target.value)}
      className="w-full border rounded p-2"
    />
  </div>

  <div className="md:col-span-2">
    <label className="block text-sm mb-1">Teacher</label>
    <Select
      className="w-full"
      options={teachers.map((t) => ({
        value: t.id,
        label: `${t.name} (${t.email}) (${t.employeeId})`,
        teacher: t,
      }))}
      value={
        selectedTeacher
          ? {
              value: selectedTeacher.id,
              label: `${selectedTeacher.name} (${selectedTeacher.email}) (${selectedTeacher.employeeId})`,
              teacher: selectedTeacher,
            }
          : null
      }
      onChange={(option) => setSelectedTeacher(option ? option.teacher : null)}
      isClearable
    />
  </div>

  <div className="flex justify-end">
    <Button
      onClick={handleDeleteByRange}
      className="w-full md:w-32 bg-red-600 hover:bg-red-700"
    >
      Delete
    </Button>
  </div>
</div>


          {/* Results */}
          {loading ? (
            <p className="text-gray-500">Loading attendance...</p>
          ) : attendance.length === 0 ? (
            <p className="text-gray-500">No attendance records found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Forenoon</TableHead>
                  <TableHead>Afternoon</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Marked By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell>{format(new Date(rec.date), "yyyy-MM-dd")}</TableCell>
                    <TableCell>{rec.forenoon}</TableCell>
                    <TableCell>{rec.afternoon}</TableCell>
                    <TableCell>
                      {rec.teacher?.name} ({rec.teacher?.employeeId})
                    </TableCell>
                    <TableCell>
                      {rec.markedBy
                        ? `${rec.markedBy.name} (${rec.markedBy.email})`
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
