"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface AttendanceRecord {
  forenoon: string;
  afternoon: string;
  date: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch attendance data
  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/attendance/users?role=teacher");
      const teachersData = await res.json();
      setTeachers(teachersData);

      const attData: Record<string, AttendanceRecord> = {};
      await Promise.all(
        teachersData.map(async (teacher: any) => {
          const attRes = await fetch(
            `/api/hr/attendance?teacherId=${teacher.id}&date=${selectedDate}`
          );
          const record = await attRes.json();
          attData[teacher.id] = record && Object.keys(record).length > 0
            ? record
            : { forenoon: "", afternoon: "", date: selectedDate };
        })
      );
      setAttendance(attData);
    } catch (error) {
      console.error("Error fetching teachers or attendance:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleChange = (teacherId: string, sessionPart: "forenoon" | "afternoon", value: string) => {
    setAttendance((prev) => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], [sessionPart]: value, date: selectedDate },
    }));
  };

  const handleSaveAll = async () => {
    const payload = teachers.map((teacher) => {
      const record = attendance[teacher.id];
      return {
        teacherId: teacher.id,
        date: selectedDate,
        forenoon: record?.forenoon || "Absent",
        afternoon: record?.afternoon || "Absent",
        markedById: session?.user?.id,
      };
    });

    try {
      const response = await fetch("/api/admin/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save attendance");

      alert("All attendance saved/updated!");
      fetchTeachers();
    } catch (error) {
      console.error(error);
      alert("Error saving attendance");
    }
  };

  if (loading) {
    return <DashboardLayout title="Attendance">Loading...</DashboardLayout>;
  }

  return (
    <DashboardLayout title="Attendance">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Mark Teacher Attendance</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard/admin/attendance/all")}>
              View Attendance by Date
            </Button>
            <Button onClick={handleSaveAll}>Save All Attendance</Button>
          </div>
        </div>

        {/* Date Picker */}
        <div className="mb-4">
          <label className="mr-2 font-semibold">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-1"
          />
        </div>

        {/* Attendance Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Forenoon</TableHead>
              <TableHead>Afternoon</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.employeeId}</TableCell>
                <TableCell>
                  <select
                    className="border rounded p-1"
                    value={attendance[teacher.id]?.forenoon || ""}
                    onChange={(e) => handleChange(teacher.id, "forenoon", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    className="border rounded p-1"
                    value={attendance[teacher.id]?.afternoon || ""}
                    onChange={(e) => handleChange(teacher.id, "afternoon", e.target.value)}
                  >
                    <option value="">Select</option>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </TableCell>
                <TableCell className="flex gap-2">
                  <Button variant="outline" onClick={() => router.push(`/dashboard/admin/attendance/history?teacherId=${teacher.id}`)}>
                    History
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
