"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Leave = {
  id: string;
  userId: string;
  userName: string;
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason?: string;
};

type LeaveType = {
  id: string;
  name: string;
  limit: number;
  description?: string;
};

export default function HRLeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  // 🔹 States for Add/Edit modal
  const [newLeaveType, setNewLeaveType] = useState({
    id: "",
    name: "",
    limit: 0,
    description: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  // 🔹 States for search
  const [searchLeaveType, setSearchLeaveType] = useState("");
  const [searchLeaves, setSearchLeaves] = useState("");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leaves");
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeaves([]);
    }
    setLoading(false);
  };

  const fetchLeaveTypes = async () => {
    try {
      const res = await fetch("/api/leaves/types");
      const data = await res.json();
      setLeaveTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeaveTypes([]);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchLeaveTypes();
  }, []);

  const handleAction = async (
    leaveId: string,
    action: "APPROVE" | "REJECT" | "CANCEL"
  ) => {
    try {
      const res = await fetch("/api/admin/leaves/action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, action }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Something went wrong");
      else {
        setMessage(`Leave ${action.toLowerCase()}d successfully`);
        fetchLeaves();
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  const handleAddLeaveType = async () => {
    try {
      const res = await fetch("/api/leaves/types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newLeaveType),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to add leave type");
      else {
        setMessage("Leave type added successfully");
        setNewLeaveType({ id: "", name: "", limit: 0, description: "" });
        setOpenModal(false);
        fetchLeaveTypes();
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  const handleUpdateLeaveType = async () => {
    try {
      const res = await fetch(`/api/leaves/types/${newLeaveType.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newLeaveType.name,
          limit: newLeaveType.limit,
          description: newLeaveType.description,
        }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Failed to update leave type");
      else {
        setMessage("Leave type updated successfully");
        setNewLeaveType({ id: "", name: "", limit: 0, description: "" });
        setIsEditing(false);
        setOpenModal(false);
        fetchLeaveTypes();
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  const handleEditLeaveType = (type: LeaveType) => {
    setNewLeaveType({
      id: type.id,
      name: type.name,
      limit: type.limit,
      description: type.description ?? "",
    });
    setIsEditing(true);
    setOpenModal(true);
  };

  const handleDeleteLeaveType = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leave type?")) return;
    try {
      const res = await fetch(`/api/leaves/types/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setMessage("Leave type deleted successfully");
      fetchLeaveTypes();
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  // 🔎 Filtered data
  const filteredLeaveTypes = leaveTypes.filter(
    (t) =>
      t.name.toLowerCase().includes(searchLeaveType.toLowerCase()) ||
      (t.description ?? "")
        .toLowerCase()
        .includes(searchLeaveType.toLowerCase())
  );

  const filteredLeaves = leaves.filter(
    (l) =>
      l.userName.toLowerCase().includes(searchLeaves.toLowerCase()) ||
      l.leaveTypeName.toLowerCase().includes(searchLeaves.toLowerCase()) ||
      l.status.toLowerCase().includes(searchLeaves.toLowerCase())
  );

  return (
    <DashboardLayout title="HR Leave Management">
      <div className="max-w-6xl mx-auto mt-10 space-y-6">
        {message && <p className="text-center text-red-600">{message}</p>}

        {/* 🔹 Add/Edit Leave Type Modal */}
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Leave Type" : "Add New Leave Type"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Name"
                value={newLeaveType.name}
                onChange={(e) =>
                  setNewLeaveType({ ...newLeaveType, name: e.target.value })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="number"
                placeholder="Limit"
                value={newLeaveType.limit}
                onChange={(e) =>
                  setNewLeaveType({
                    ...newLeaveType,
                    limit: Number(e.target.value),
                  })
                }
                className="border p-2 rounded w-full"
              />
              <input
                type="text"
                placeholder="Description"
                value={newLeaveType.description}
                onChange={(e) =>
                  setNewLeaveType({
                    ...newLeaveType,
                    description: e.target.value,
                  })
                }
                className="border p-2 rounded w-full"
              />
            </div>
            <DialogFooter>
              {isEditing ? (
                <>
                  <Button onClick={handleUpdateLeaveType}>Update</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setNewLeaveType({
                        id: "",
                        name: "",
                        limit: 0,
                        description: "",
                      });
                      setOpenModal(false);
                    }}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddLeaveType}>Add</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Leave Types Table */}
        <div className="overflow-x-auto border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold text-lg">All Leave Types</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search leave types..."
                value={searchLeaveType}
                onChange={(e) => setSearchLeaveType(e.target.value)}
                className="border p-2 rounded w-64"
              />
              <Button
                onClick={() => {
                  setNewLeaveType({
                    id: "",
                    name: "",
                    limit: 0,
                    description: "",
                  });
                  setIsEditing(false);
                  setOpenModal(true);
                }}
              >
                + Add Leave Type
              </Button>
            </div>
          </div>
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
              {filteredLeaveTypes.map((type) => (
                <TableRow key={type.id}>
                  <TableCell>{type.name}</TableCell>
                  <TableCell>{type.limit}</TableCell>
                  <TableCell>{type.description || "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" onClick={() => handleEditLeaveType(type)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteLeaveType(type.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeaveTypes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No leave types found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Leaves Table */}
        {loading ? (
          <p>Loading leaves...</p>
        ) : (
          <div className="overflow-x-auto border rounded p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold text-lg">Leave Requests</h2>
              <input
                type="text"
                placeholder="Search leave requests..."
                value={searchLeaves}
                onChange={(e) => setSearchLeaves(e.target.value)}
                className="border p-2 rounded w-64"
              />
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.userName}</TableCell>
                    <TableCell>{leave.leaveTypeName}</TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>{leave.status}</TableCell>
                    <TableCell>{leave.reason || "-"}</TableCell>
                    <TableCell className="space-x-2">
                      {leave.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(leave.id, "APPROVE")}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(leave.id, "REJECT")}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {leave.status === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleAction(leave.id, "CANCEL")}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredLeaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No leave requests found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
