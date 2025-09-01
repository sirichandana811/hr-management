"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

type AttendanceRecord = {
  id: string;
  date: string;
  forenoon: string;
  afternoon: string;
  markedBy?: { name: string | null; email: string } | null;
};

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [workingDays, setWorkingDays] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await fetch("/api/teacherattendance");
      const data = await res.json();
      setAttendance(data.attendance ?? []);
      setWorkingDays(data.workingDays ?? 0);
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/teacher");
    }
  };

  return (
    <DashboardLayout title="Attendance">
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Attendance</CardTitle>
            <p className="text-sm text-gray-500">
              Total Working Days: <span className="font-semibold">{workingDays}</span>
            </p>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : attendance.length === 0 ? (
              <p className="text-gray-500 text-center py-6">
                No attendance records found.
              </p>
            ) : (
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
                  {attendance.map(({ id, date, forenoon, afternoon, markedBy }) => (
                    <TableRow key={id}>
                      <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
                      <TableCell>{forenoon}</TableCell>
                      <TableCell>{afternoon}</TableCell>
                      <TableCell>
                        {markedBy ? `${markedBy.name ?? "Unknown"} (${markedBy.email})` : "System"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
