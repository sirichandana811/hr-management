"use client";

import { useState, useEffect } from "react";
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

interface User {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  attendance?: AttendanceRecord; // may be undefined
}

export default function AttendancePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  ); // YYYY-MM-DD
  const [selectedRole, setSelectedRole] = useState<"TEACHER" | "HR">("TEACHER");
  const [loading, setLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);

  const [attendance, setAttendance] = useState<{
    [key: string]: AttendanceRecord;
  }>({});

  // Fetch users + attendance for selected date
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/attendance?role=${selectedRole}&date=${selectedDate}`
      );
      const data: User[] = await res.json();

      setUsers(data);

      const attState: { [key: string]: AttendanceRecord } = {};
      data.forEach((user) => {
        attState[user.id] = user.attendance || {
          forenoon: "Present",
          afternoon: "Present",
          date: selectedDate,
        };
      });
      setAttendance(attState);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [selectedDate, selectedRole]);

  const handleChange = (
    userId: string,
    sessionPart: "forenoon" | "afternoon",
    value: string
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [sessionPart]: value, date: selectedDate },
    }));
  };

  const handleSaveAll = async () => {
  if (!session?.user?.id) return;
  setSaveLoading(true);

  try {
    const records = Object.entries(attendance).map(([userId, record]) => ({
      teacherId: userId,           // can be HR id too
      date: record.date || selectedDate,
      forenoon: record.forenoon,
      afternoon: record.afternoon,
      markedById: session.user.id,
      role: selectedRole,          // ✅ send role along with each record
    }));

    const res = await fetch("/api/admin/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(records),
    });

    if (res.ok) {
      alert("Attendance saved/updated successfully!");
      fetchUsers();
    } else {
      const err = await res.json();
      console.error("Error saving attendance:", err);
      alert("Error saving attendance. Check console.");
    }
  } catch (error) {
    console.error("Error saving attendance:", error);
    alert("Error saving attendance. Check console.");
  }

  setSaveLoading(false);
};

  if (loading)
    return <DashboardLayout title="Attendance">Loading...</DashboardLayout>;

  return (
    <DashboardLayout title="Attendance">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">
            Mark Attendance ({selectedRole === "TEACHER" ? "Teachers" : "HR"})
          </h1>
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/admin/attendance/all")}
          >
            View Attendance by Date
          </Button>
        </div>

        {/* Role & Date Selector */}
        <div className="mb-4 flex justify-between items-center gap-4">
          <div className="flex gap-4 items-center">
            <div>
              <label className="mr-2 font-semibold">Role:</label>
              <select
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(e.target.value as "TEACHER" | "HR")
                }
                className="border rounded p-1"
              >
                <option value="TEACHER">Teacher</option>
                <option value="HR">HR</option>
              </select>
            </div>

            <div>
              <label className="mr-2 font-semibold">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border rounded p-1"
              />
            </div>
          </div>

          <Button onClick={handleSaveAll} disabled={saveLoading}>
            {saveLoading ? "Saving..." : "Update All"}
          </Button>
        </div>

        <Table className="shadow-sm rounded border">
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
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.employeeId}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {["Present", "Absent"].map((option) => (
                      <label key={option} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`forenoon-${user.id}`}
                          value={option}
                          checked={attendance[user.id]?.forenoon === option}
                          onChange={(e) =>
                            handleChange(user.id, "forenoon", e.target.value)
                          }
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
                          name={`afternoon-${user.id}`}
                          value={option}
                          checked={attendance[user.id]?.afternoon === option}
                          onChange={(e) =>
                            handleChange(user.id, "afternoon", e.target.value)
                          }
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
