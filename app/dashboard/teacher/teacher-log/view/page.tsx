"use client";

import { useEffect, useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil } from "lucide-react";

type TeachingLog = {
  id: string;
  className: string;
  subject: string;
  topic: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  year?: string;
  college?: string;
  branch?: string;
  teacher: { id: string; name: string | null; email: string };
};

// helper to format datetime into HH:mm
const formatTime = (dateString?: string) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "";
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

export default function HRTeachingLogReviewPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<TeachingLog[]>([]);
  const [loading, setLoading] = useState(true);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // editing
  const [editingLog, setEditingLog] = useState<TeachingLog | null>(null);
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    topic: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    year: "",
    college: "",
    branch: "",
  });
  const [saving, setSaving] = useState(false);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // Fetch all logs once (no backend filtering)
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/topics`);
      const data = await res.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Apply frontend filtering
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const searchMatch =
        log.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.teacher?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.teacher?.email?.toLowerCase().includes(searchQuery.toLowerCase());

      let dateMatch = true;
      if (fromDate) {
        dateMatch = new Date(log.date) >= new Date(fromDate);
      }
      if (toDate && dateMatch) {
        dateMatch = new Date(log.date) <= new Date(toDate);
      }

      return searchMatch && dateMatch;
    });
  }, [logs, searchQuery, fromDate, toDate]);

  // Pagination applied after filtering
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1); // reset when filters change
  }, [searchQuery, fromDate, toDate]);

  const handleEdit = (log: TeachingLog) => {
    setEditingLog(log);
    setFormData({
      className: log.className,
      subject: log.subject,
      topic: log.topic,
      description: log.description || "",
      date: log.date.slice(0, 10),
      startTime: formatTime(log.startTime),
      endTime: formatTime(log.endTime),
      year: log.year || "",
      college: log.college || "",
      branch: log.branch || "",
    });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingLog) return;
    setSaving(true);
    try {
      const res = await fetch("/api/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLog.id,
          ...formData,
        }),
      });

      if (res.ok) {
        fetchLogs();
        setEditingLog(null);
      } else {
        console.error("Failed to save");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      const res = await fetch(`/api/topics?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchLogs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout title="Teaching Logs (HR/Admin)">
      <div className="flex justify-between mb-4">
        <Button onClick={() => router.back()} variant="outline">
          Back
        </Button>
        <Button onClick={() => router.push("/dashboard/teacher/teacher-log")}>
          + Create Topic
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="Search by topic, subject, teacher…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
         <Input
    type="date"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
    className="w-36 text-sm"
  />

  {/* To Date */}
  <Input
    type="date"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
    className="w-36 text-sm"
  />

        {(fromDate || toDate) && (
          <Button
            variant="outline"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
          >
            Clear Dates
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : paginatedLogs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No logs found.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>College</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.college || "-"}</TableCell>
                    <TableCell>{log.branch || "-"}</TableCell>
                    <TableCell>{log.year || "-"}</TableCell>
                    <TableCell>{log.className}</TableCell>
                    <TableCell>{log.subject}</TableCell>
                    <TableCell>{log.topic}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {log.description}
                    </TableCell>
                    <TableCell>
                      {new Date(log.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {log.startTime ? formatTime(log.startTime) : "-"}
                    </TableCell>
                    <TableCell>
                      {log.endTime ? formatTime(log.endTime) : "-"}
                    </TableCell>
                    <TableCell className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(log)}
                      >
                        <Pencil className="w-4 h-4 mr-1" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(log.id)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                        size="sm"
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teaching Log</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="College"
              value={formData.college}
              onChange={(e) => handleChange("college", e.target.value)}
            />
            <Input
              placeholder="Branch"
              value={formData.branch}
              onChange={(e) => handleChange("branch", e.target.value)}
            />

            <select
              className="border p-2 rounded"
              value={formData.year}
              onChange={(e) => handleChange("year", e.target.value)}
            >
              <option value="">Select Year</option>
              <option value="1st">1st Year</option>
              <option value="2nd">2nd Year</option>
              <option value="3rd">3rd Year</option>
              <option value="4th">4th Year</option>
            </select>

            <Input
              placeholder="Class"
              value={formData.className}
              onChange={(e) => handleChange("className", e.target.value)}
            />
            <Input
              placeholder="Subject"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
            />
            <Input
              placeholder="Topic"
              value={formData.topic}
              onChange={(e) => handleChange("topic", e.target.value)}
            />

            <textarea
              placeholder="Description"
              className="border p-2 rounded"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />

            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
            <div className="flex gap-4">
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
              />
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLog(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
