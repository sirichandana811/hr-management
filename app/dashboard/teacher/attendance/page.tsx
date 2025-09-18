"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

  // ✅ new states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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

  // ✅ Filtered attendance by fromDate and toDate
  const filteredAttendance = useMemo(() => {
    let result = attendance;

    if (fromDate && toDate && fromDate < toDate) {
      result = result.filter(
        (rec) => rec.date.slice(0, 10) >= fromDate
      ).filter(
        (rec) => rec.date.slice(0, 10) <= toDate
      );
    } else if (fromDate) {
      result = result.filter(
        (rec) => rec.date.slice(0, 10) === fromDate
      );
    }

    return result;
  }, [attendance, fromDate, toDate]);

  // Counts
  const counts = useMemo(() => {
    let forenoonPresent = 0,
      forenoonAbsent = 0,
      afternoonPresent = 0,
      afternoonAbsent = 0;

    attendance.forEach((rec) => {
      if (rec.forenoon?.toLowerCase() === "present") forenoonPresent++;
      if (rec.forenoon?.toLowerCase() === "absent") forenoonAbsent++;
      if (rec.afternoon?.toLowerCase() === "present") afternoonPresent++;
      if (rec.afternoon?.toLowerCase() === "absent") afternoonAbsent++;
    });

    return { forenoonPresent, forenoonAbsent, afternoonPresent, afternoonAbsent };
  }, [attendance]);

  const handleBack = () => {
    router.push("/dashboard/teacher");
  };

  return (
    <DashboardLayout title="Attendance">
      <div className="flex justify-between mb-4">
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>

        {/* ✅ From - To Date Filter */}
        <div className="flex gap-2">
          <p>From:</p>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="max-w-[160px]"
          />
            
          <p>To:</p>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="max-w-[160px]"
          />
        </div>
      </div>

      <div className="p-6 space-y-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>My Attendance</CardTitle>
            <p className="text-sm text-gray-500">
              Total Working Days: <span className="font-semibold">{workingDays}</span>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
              <p>Forenoon Present: <span className="font-semibold">{counts.forenoonPresent}</span></p>
              <p>Forenoon Absent: <span className="font-semibold">{counts.forenoonAbsent}</span></p>
              <p>Afternoon Present: <span className="font-semibold">{counts.afternoonPresent}</span></p>
              <p>Afternoon Absent: <span className="font-semibold">{counts.afternoonAbsent}</span></p>
            </div>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : filteredAttendance.length === 0 ? (
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
                  {filteredAttendance.map(({ id, date, forenoon, afternoon, markedBy }) => (
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
