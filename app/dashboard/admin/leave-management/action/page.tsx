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
import { useRouter } from "next/navigation";

// ✅ Helper function to calculate working days
function calculateWorkingDays(startDate: string, endDate: string): number {
  let start = new Date(startDate);
  let end = new Date(endDate);
  let count = 0;

  while (start <= end) {
    const day = start.getDay(); // 0 = Sun, 6 = Sat
    if (day !== 0 && day !== 6) {
      count++;
    }
    start.setDate(start.getDate() + 1);
  }
  return count;
}

// Simple modal component
function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[400px] relative">
        {children}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

type Leave = {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string; // ✅ assuming email is available
  employeeId?: string; // ✅ assuming employeeId is available
  leaveTypeId: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason?: string;
};

export default function HRLeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [editLeave, setEditLeave] = useState<Leave | null>(null);
  const [role, setRole] = useState("HR"); // ✅ default HR
  const [search, setSearch] = useState(""); // ✅ search filter
  const router = useRouter();

  // fetch all leave requests by role
  const fetchLeaves = async (selectedRole: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leaves?role=${selectedRole}`);
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeaves([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves(role);
  }, [role]); // ✅ refetch when role changes

  // ✅ Filter leaves based on search query
  const filteredLeaves = leaves.filter((leave) => {
    const query = search.toLowerCase();
    return (
      leave.userName?.toLowerCase().includes(query) ||
      leave.userEmail?.toLowerCase().includes(query) ||
      leave.employeeId?.toLowerCase().includes(query)
    );
  });

  // handle approve/reject/cancel
  const handleAction = async (
    leaveId: string,
    action: "APPROVE" | "REJECT" | "CANCEL"
  ) => {
    const leave = leaves.find((l) => l.id === leaveId);
    if (!leave) return;

    if (action === "APPROVE" && (!leave.days || leave.days < 1)) {
      alert("Days must be at least 1");
      return;
    }

    const confirmMsg =
      action === "APPROVE"
        ? `Approve ${leave.days} day(s) of leave?`
        : action === "REJECT"
        ? "Are you sure you want to reject this leave?"
        : "Are you sure you want to cancel this leave?";

    if (!window.confirm(confirmMsg)) return;

    setProcessing(leaveId);
    try {
      const res = await fetch("/api/admin/leaves/action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, action, days: leave.days }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
      } else {
        setMessage(`Leave ${action.toLowerCase()}d successfully`);
        fetchLeaves(role); // ✅ refetch for current role
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    } finally {
      setProcessing(null);
      setTimeout(() => setMessage(null), 10000);
    }
  };

  // ✅ save edited leave (call backend)
  const saveEditedLeave = async () => {
    if (!editLeave) return;

    try {
      const res = await fetch("/api/admin/leaves/edit", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveId: editLeave.id,
          startDate: editLeave.startDate,
          endDate: editLeave.endDate,
          days: editLeave.days, // ✅ already auto-calculated
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Failed to update leave");
      } else {
        setMessage("Leave updated successfully");
        fetchLeaves(role);
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong");
    } finally {
      setEditLeave(null);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <DashboardLayout title="HR Leave Management">
      <div className="max-w-6xl mx-auto mt-10">
        {/* ✅ Role Selection & Search */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="HR">HR</option>
              <option value="TEACHER">TEACHER</option>
            </select>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, employee ID..."
              className="border rounded px-3 py-1 w-72"
            />
          </div>

          <button
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => router.push("/dashboard/admin/leave-management")}
          >
            + New Leave Type
          </button>
        </div>

        {message && (
          <p className="text-center text-blue-600 mb-4">{message}</p>
        )}

        {loading ? (
          <p>Loading...</p>
        ) : filteredLeaves.length === 0 ? (
          <p>No leaves found for {role}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Employee ID</TableHead>
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
                  <TableCell>{leave.userEmail || "-"}</TableCell>
                  <TableCell>{leave.employeeId || "-"}</TableCell>
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
                          variant="outline"
                          onClick={() => setEditLeave(leave)}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          disabled={processing === leave.id}
                          onClick={() => handleAction(leave.id, "APPROVE")}
                        >
                          {processing === leave.id
                            ? "Processing..."
                            : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={processing === leave.id}
                          onClick={() => handleAction(leave.id, "REJECT")}
                        >
                          {processing === leave.id ? "Processing..." : "Reject"}
                        </Button>
                      </>
                    )}

                    {leave.status === "APPROVED" && (
                      <>
                      <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditLeave(leave)}
                        >
                          Edit
                        </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={processing === leave.id}
                        onClick={() => handleAction(leave.id, "CANCEL")}
                      >
                        {processing === leave.id ? "Processing..." : "Cancel"}
                      </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Modal */}
        <Modal open={!!editLeave} onClose={() => setEditLeave(null)}>
          {editLeave && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Edit Leave</h2>
              <div className="flex flex-col space-y-3">
                <label className="flex flex-col">
                  <span className="text-sm font-medium">Start Date</span>
                  <input
                    type="date"
                    value={editLeave.startDate.split("T")[0]}
                    onChange={(e) => {
                      const updated = {
                        ...editLeave,
                        startDate: e.target.value,
                        days: calculateWorkingDays(
                          e.target.value,
                          editLeave.endDate
                        ),
                      };
                      setEditLeave(updated);
                    }}
                    className="border rounded px-2 py-1"
                  />
                </label>

                <label className="flex flex-col">
                  <span className="text-sm font-medium">End Date</span>
                  <input
                    type="date"
                    value={editLeave.endDate.split("T")[0]}
                    onChange={(e) => {
                      const updated = {
                        ...editLeave,
                        endDate: e.target.value,
                        days: calculateWorkingDays(
                          editLeave.startDate,
                          e.target.value
                        ),
                      };
                      setEditLeave(updated);
                    }}
                    className="border rounded px-2 py-1"
                  />
                </label>

                <div>
                  <span className="text-sm font-medium">Calculated Days</span>
                  <p className="border rounded px-2 py-1 bg-gray-100">
                    {editLeave.days}
                  </p>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <Button variant="secondary" onClick={() => setEditLeave(null)}>
                  Cancel
                </Button>
                <Button onClick={saveEditedLeave}>Save</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
