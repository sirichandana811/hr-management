"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Loader2, Pencil, Trash } from "lucide-react";

type TeachingLog = {
  id: string;
  className: string;
  subject: string;
  topic: string;
  description: string;
  date: string;
  startTime?: string;
  endTime?: string;
  teacher: { id: string; name: string | null; email: string };
};

export default function HRTeachingLogReviewPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<TeachingLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingLog, setEditingLog] = useState<TeachingLog | null>(null);
  const [formData, setFormData] = useState({
    className: "",
    subject: "",
    topic: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });
  const [saving, setSaving] = useState(false);

  // Fetch logs safely
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/topics");
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
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

  // Filter logs safely
  const filteredLogs = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!Array.isArray(logs)) return [];

    return logs.filter(
      (log) =>
        (log.topic?.toLowerCase() || "").includes(q) ||
        (log.description?.toLowerCase() || "").includes(q) ||
        (log.className?.toLowerCase() || "").includes(q) ||
        (log.subject?.toLowerCase() || "").includes(q) ||
        (log.teacher.name?.toLowerCase() || "").includes(q) ||
        (log.teacher.email?.toLowerCase() || "").includes(q)
    );
  }, [logs, searchQuery]);

  const handleEdit = (log: TeachingLog) => {
    setEditingLog(log);
    setFormData({
      className: log.className,
      subject: log.subject,
      topic: log.topic,
      description: log.description,
      date: log.date.slice(0, 10),
      startTime: log.startTime || "",
      endTime: log.endTime || "",
    });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingLog) return;
    setSaving(true);
    try {
      const startDateTime = formData.startTime
        ? new Date(`${formData.date}T${formData.startTime}`)
        : null;
      const endDateTime = formData.endTime
        ? new Date(`${formData.date}T${formData.endTime}`)
        : null;

      const res = await fetch("/api/topics", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingLog.id,
          className: formData.className,
          subject: formData.subject,
          topic: formData.topic,
          description: formData.description,
          date: new Date(formData.date),
          startTime: startDateTime,
          endTime: endDateTime,
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

  // DELETE handler (uses query param ?id=...)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    try {
      const res = await fetch(`/api/topics?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchLogs();
      } else {
        console.error("Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard/teacher");
    }
  };

  return (
    <DashboardLayout title="Teaching Logs (HR/Admin)">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-md"
        >
          Back
        </button>
      </div>

      <div className="space-y-6">
        <Input
          placeholder="Search by topic, description, class, subject, teacher…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          onClick={() => router.push("/dashboard/teacher/teacher-log")}
          className="mb-4 px-4 py-2 bg-black text-white rounded"
        >
          + Create Topic
        </button>

        {loading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No logs found.</p>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
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
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={!!editingLog} onOpenChange={() => setEditingLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Topic</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
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
      </div>
    </DashboardLayout>
  );
}
