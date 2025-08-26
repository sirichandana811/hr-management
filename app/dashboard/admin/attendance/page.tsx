"use client";

import { useState, useEffect } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
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
  const [attendance, setAttendance] = useState<{ [key: string]: AttendanceRecord }>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTeachers();
  }, [selectedDate]); // Reload when date changes

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/attendance/users?role=teacher");
      const data = await res.json();
      setTeachers(data);

      // Fetch existing attendance for all teachers on selected date
      const attData: { [key: string]: AttendanceRecord } = {};
      for (const teacher of data) {
        const attRes = await fetch(`/api/hr/attendance?teacherId=${teacher.id}&date=${selectedDate}`);
        const record = await attRes.json();
        if (record && Object.keys(record).length > 0) {
          attData[teacher.id] = record;
        } else {
          // Initialize with empty values
          attData[teacher.id] = { forenoon: "", afternoon: "", date: selectedDate };
        }
      }
      setAttendance(attData);
    } catch (error) {
      console.error("Error fetching teachers or attendance:", error);
    }
    setLoading(false);
  };

  const handleChange = (teacherId: string, sessionPart: "forenoon" | "afternoon", value: string) => {
    setAttendance((prev) => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], [sessionPart]: value, date: selectedDate },
    }));
  };

  const handleSaveOrUpdate = async (teacherId: string) => {
    const record = attendance[teacherId];
    if (!record) return;

    const response = await fetch("/api/admin/attendance", {
      method: "POST", // Upsert logic in backend
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teacherId,
        date: selectedDate,
        forenoon: record.forenoon || "Absent",
        afternoon: record.afternoon || "Absent",
        markedById: session?.user.id,
      }),
    });

    if (response.ok) {
      alert("Attendance saved/updated!");
      fetchTeachers(); // Reload attendance
    } else {
      alert("Error saving attendance");
    }
  };

  const handleHistory = (teacherId: string) => {
    router.push(`/dashboard/admin/attendance/history?teacherId=${teacherId}`);
  };

  const handleViewByDate = () => {
    router.push(`/dashboard/admin/attendance/all`);
  };

  if (loading) return <DashboardLayout title="Attendance">Loading...</DashboardLayout>;

  return (
    <DashboardLayout title="Attendance">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Mark Teacher Attendance</h1>
          <Button variant="outline" onClick={handleViewByDate}>
            View Attendance by Date
          </Button>
        </div>

        <div className="mb-4">
          <label className="mr-2 font-semibold">Select Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded p-1"
          />
        </div>

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
                  <Button onClick={() => handleSaveOrUpdate(teacher.id)}>Update</Button>
                  <Button variant="outline" onClick={() => handleHistory(teacher.id)}>
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
