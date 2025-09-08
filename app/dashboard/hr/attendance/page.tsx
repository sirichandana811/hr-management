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
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchTeachers();
  }, [selectedDate]); // Reload when date changes

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/attendance/users?role=teacher");
      const teacherList: any[] = await res.json();
      setTeachers(teacherList);

      const attendanceResponses = await Promise.all(
        teacherList.map((teacher) =>
          fetch(`/api/hr/attendance?teacherId=${teacher.id}&date=${selectedDate}`).then((res) => res.json())
        )
      );

      const attData: { [key: string]: AttendanceRecord } = {};
      teacherList.forEach((teacher, index: number) => {
        const record = attendanceResponses[index];
        attData[teacher.id] =
          record && Object.keys(record).length > 0
            ? record
            : { forenoon: "", afternoon: "", date: selectedDate };
      });

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

  // ✅ New function: update all teachers' attendance at once
  const handleSaveAll = async () => {
    if (saveLoading) return; // Prevent multiple clicks
    setSaveLoading(true);
    try {
      const records = Object.entries(attendance).map(([teacherId, record]) => ({
        teacherId,
        date: selectedDate,
        forenoon: record?.forenoon ? record.forenoon : "Present",
        afternoon: record?.afternoon ? record.afternoon : "Present",
        markedById: session?.user.id,
      }));

      const response = await fetch("/api/hr/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(records),
      });

      if (response.ok) {
        alert("All attendance saved/updated!");
        fetchTeachers();
      } else {
        alert("Error saving attendance");
      }
    } catch (error) {
      console.error("Error saving all attendance:", error);
      alert("Error saving attendance");
    }finally {
      setSaveLoading(false);
    }
  };

  

  if (loading) return <DashboardLayout title="Attendance">Loading...</DashboardLayout>;

  return (
    <DashboardLayout title="Attendance">
      <div className="p-6">
        <h1 className="text-xl font-bold mb-4">Mark Teacher Attendance</h1>

        <div className="mb-4 flex justify-between items-center">
          <div>
            <label className="mr-2 font-semibold">Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded p-1"
            />
          </div>
          {/* ✅ Single button to update all teachers */}
          <Button onClick={handleSaveAll}>Update All</Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Forenoon</TableHead>
              <TableHead>Afternoon</TableHead>
           
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.employeeId}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {["Present", "Absent"].map((option) => (
                      <label key={option} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`forenoon-${teacher.id}`}
                          value={option}
                          checked={attendance[teacher.id]?.forenoon === option}
                          onChange={(e) => handleChange(teacher.id, "forenoon", e.target.value)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {["Present", "Absent"].map((option) => (
                      <label key={option} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`afternoon-${teacher.id}`}
                          value={option}
                          checked={attendance[teacher.id]?.afternoon === option}
                          onChange={(e) => handleChange(teacher.id, "afternoon", e.target.value)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
