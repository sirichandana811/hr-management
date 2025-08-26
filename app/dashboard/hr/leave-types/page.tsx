"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";

type LeaveType = {
  id: string;
  name: string;
  limit: number;
  description?: string;
};

export default function HRLeavesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Edit modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLeave, setEditingLeave] = useState<LeaveType | null>(null);
  const [editName, setEditName] = useState("");
  const [editLimit, setEditLimit] = useState<number | "">("");
  const [editDescription, setEditDescription] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    const res = await fetch("/api/leaves/types");
    const data = await res.json();
    setLeaveTypes(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name")?.toString().trim();
    const limit = Number(formData.get("limit"));
    const description = formData.get("description")?.toString().trim();

    if (!name || !limit) {
      setMessage({ type: "error", text: "Please enter leave name and limit" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/leaves/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, limit, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to create" });
      } else {
        setMessage({ type: "success", text: "Created successfully" });
        form.reset();
        fetchLeaveTypes();
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (leave: LeaveType) => {
    setEditingLeave(leave);
    setEditName(leave.name);
    setEditLimit(leave.limit);
    setEditDescription(leave.description || "");
    setIsEditOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingLeave) return;

    if (!editName || !editLimit) {
      setMessage({ type: "error", text: "Please enter leave name and limit" });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/leaves/types/${editingLeave.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, limit: Number(editLimit), description: editDescription }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to update" });
      } else {
        setMessage({ type: "success", text: "Updated successfully" });
        setIsEditOpen(false);
        fetchLeaveTypes();
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave type?")) return;
    try {
      const res = await fetch(`/api/leaves/types/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Failed to delete" });
      } else {
        setMessage({ type: "success", text: "Deleted successfully" });
        fetchLeaveTypes();
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong" });
    }
  };

  const filteredLeaveTypes = leaveTypes.filter((leave) =>
    leave.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Manage Leave Types">
      <div className="max-w-4xl mx-auto mt-10 space-y-6">
        <Button variant="outline" onClick={() => router.back()}>
          &larr; Back
        </Button>

        {/* Create Leave Type */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Create New Leave Type</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Leave Name</Label>
                <Input id="name" name="name" type="text" required />
              </div>
              <div>
                <Label htmlFor="limit">Leave Limit (days)</Label>
                <Input id="limit" name="limit" type="number" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" type="text" />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Create Leave Type"}
              </Button>
            </form>
            {message && (
              <p className={`mt-2 text-sm ${message.type === "error" ? "text-red-600" : "text-green-600"}`}>
                {message.text}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Search */}
        <Input
          placeholder="Search leave types..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4"
        />

        {/* Existing Leave Types */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Existing Leave Types</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaveTypes.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.name}</TableCell>
                    <TableCell>{leave.limit}</TableCell>
                    <TableCell>{leave.description || "-"}</TableCell>
                    <TableCell className="space-x-2">
                      <Dialog open={isEditOpen && editingLeave?.id === leave.id} onOpenChange={setIsEditOpen}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => handleEditOpen(leave)}>
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Leave Type</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Name</Label>
                              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                            </div>
                            <div>
                              <Label>Limit</Label>
                              <Input
                                type="number"
                                value={editLimit}
                                onChange={(e) => setEditLimit(e.target.value === "" ? "" : Number(e.target.value))}
                              />
                            </div>
                            <div>
                              <Label>Description</Label>
                              <Input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                            </div>
                            <div className="flex justify-end space-x-2">
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button onClick={handleEditSubmit} disabled={loading}>
                                {loading ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button size="sm" variant="destructive" onClick={() => handleDelete(leave.id)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
