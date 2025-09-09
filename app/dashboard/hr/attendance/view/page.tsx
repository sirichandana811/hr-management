"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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

  // ✅ Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchAttendance = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(`/api/hr/attendance/view?${params.toString()}`);
      const data = await res.json();
      setAttendance(data.attendance ?? []);
      setWorkingDays(data.workingDays ?? 0);
    } catch (err) {
      console.error("Failed to load attendance", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/hr");
    }
  };

  // ✅ Calculate stats
  const stats = useMemo(() => {
    let forenoonPresent = 0;
    let forenoonAbsent = 0;
    let afternoonPresent = 0;
    let afternoonAbsent = 0;

    attendance.forEach((rec) => {
      if (rec.forenoon === "Present") forenoonPresent++;
      else if (rec.forenoon === "Absent") forenoonAbsent++;

      if (rec.afternoon === "Present") afternoonPresent++;
      else if (rec.afternoon === "Absent") afternoonAbsent++;
    });

    return {
      forenoonPresent,
      forenoonAbsent,
      afternoonPresent,
      afternoonAbsent,
    };
  }, [attendance]);

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
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-semibold">Forenoon:</span> {stats.forenoonPresent} Present,{" "}
                {stats.forenoonAbsent} Absent
              </p>
              <p>
                <span className="font-semibold">Afternoon:</span> {stats.afternoonPresent} Present,{" "}
                {stats.afternoonAbsent} Absent
              </p>
            </div>
          </CardHeader>

          <CardContent>
            {/* ✅ Date Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
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
              <div className="flex items-end">
                <Button onClick={fetchAttendance} className="w-full md:w-32">
                  Filter
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            ) : attendance.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No attendance records found.</p>
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
