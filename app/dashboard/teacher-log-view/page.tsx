"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Teacher = {
  id: string;
  name: string;
  email: string;
  employeeId: string;
};

type TeachingLog = {
  id: string;
  className: string;
  subject: string;
  topic: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  teacher: Teacher;
};

export default function HRTeachingLogReviewPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [logs, setLogs] = useState<TeachingLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedDate, setSelectedDate] = useState(""); // ✅ one date filter

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch teacher list once
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/teacher-log/teacher");
        const data = await res.json();
        if (Array.isArray(data)) {
          setTeachers(data.sort((a: Teacher, b: Teacher) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        console.error("Failed to fetch teachers", err);
      }
    };
    fetchTeachers();
  }, []);

  // Fetch logs when teacher is selected
  useEffect(() => {
    if (!selectedTeacher) {
      setLogs([]);
      return;
    }
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/teacher-log?teacherId=${selectedTeacher.id}`);
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch logs", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [selectedTeacher]);

  // Filter teachers for search
  const filteredTeachers = useMemo(() => {
    const q = teacherSearch.toLowerCase();
    return teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.employeeId.toLowerCase().includes(q)
    );
  }, [teachers, teacherSearch]);

  const selectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setTeacherSearch(`${teacher.name} (${teacher.employeeId})`);
    setShowDropdown(false);
  };

  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/auth/signin");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Filter logs by selected date
  const filteredLogs = useMemo(() => {
    if (!selectedDate) return logs;
    return logs.filter(
      (log) =>
        new Date(log.date).toISOString().split("T")[0] === selectedDate
    );
  }, [logs, selectedDate]);

  return (
    <DashboardLayout title="Teaching Logs">
      <div className="flex justify-between items-center mb-4">
        <Button onClick={handleBack} variant="secondary">
          Back
        </Button>
      </div>

      {/* Teacher Search Input */}
      <div className="mb-4 relative" ref={dropdownRef}>
        <Input
          placeholder="Search and select a teacher..."
          value={teacherSearch}
          onChange={(e) => {
            setTeacherSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          className="mb-2"
        />
        {showDropdown && (
          <div className="absolute z-10 bg-white border w-full max-h-60 overflow-y-auto rounded-md shadow-md">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                onClick={() => selectTeacher(teacher)}
              >
                {teacher.name} ({teacher.employeeId}) - {teacher.email}
              </div>
            ))}
            {filteredTeachers.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500">No teachers found</div>
            )}
          </div>
        )}
      </div>

      {/* ✅ Date Filter */}
      <div className="mb-4">
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          disabled={!selectedTeacher}
          className="w-fit"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : !selectedTeacher ? (
        <p className="text-sm text-muted-foreground">Please select a teacher to view logs.</p>
      ) : filteredLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No logs found for this teacher {selectedDate ? `on ${selectedDate}` : ""}.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.className}</TableCell>
                  <TableCell>{log.subject}</TableCell>
                  <TableCell>{log.topic}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{log.description}</TableCell>
                  <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {log.startTime
                      ? new Date(log.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {log.endTime
                      ? new Date(log.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </DashboardLayout>
  );
}
