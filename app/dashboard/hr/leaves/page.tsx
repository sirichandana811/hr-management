"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

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

export default function HRLeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hr/leaves");
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setLeaves([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (leaveId: string, action: "APPROVE" | "REJECT" | "CANCEL") => {
    try {
      const res = await fetch("/api/hr/leaves/action", {
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

  return (
    <DashboardLayout title="HR Leave Management">
      <div className="max-w-6xl mx-auto mt-10">
        {message && <p className="text-center text-red-600 mb-4">{message}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : leaves.length === 0 ? (
          <p>No leaves found</p>
        ) : (
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
              {Array.isArray(leaves) &&
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{leave.userName}</TableCell>
                    <TableCell>{leave.leaveTypeName}</TableCell>
                    <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>{leave.days}</TableCell>
                    <TableCell>{leave.status}</TableCell>
                    <TableCell>{leave.reason || "-"}</TableCell>
                    <TableCell className="space-x-2">
                      {leave.status === "PENDING" && (
                        <>
                          <Button size="sm" onClick={() => handleAction(leave.id, "APPROVE")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleAction(leave.id, "REJECT")}>
                            Reject
                          </Button>
                        </>
                      )}
                      {leave.status === "APPROVED" && (
                        <Button size="sm" variant="destructive" onClick={() => handleAction(leave.id, "CANCEL")}>
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
    </DashboardLayout>
  );
}
