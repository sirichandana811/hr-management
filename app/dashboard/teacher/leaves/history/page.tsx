"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

type Leave = {
  id: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  reason?: string;
  createdAt: string;
};

export default function LeaveHistoryPage() {
  const { data: session } = useSession();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const fetchLeaves = async () => {
    if (!session?.user.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/leaves/history?userId=${session.user.id}`);
      const data = await res.json();
      setLeaves(data || []);
    } catch (err) {
      console.error(err);
      setLeaves([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLeaves();
  }, [session?.user.id]);

  const handleCancel = async (leaveId: string) => {
    if (!session?.user.id) return;
    try {
      const res = await fetch("/api/leaves/history", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, userId: session.user.id }),
      });
      const data = await res.json();
      if (!res.ok) setMessage(data.error || "Something went wrong");
      else {
        setMessage("Leave cancelled successfully!");
        fetchLeaves(); // refresh the list
      }
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong");
    }
  };

  return (
    <DashboardLayout title="Leave History">
      <div className="max-w-5xl mx-auto mt-10">
        {message && <p className="text-center text-red-600 mb-4">{message}</p>}
        {loading ? (
          <p>Loading...</p>
        ) : leaves.length === 0 ? (
          <p>No leaves found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
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
              {leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>{leave.leaveTypeName}</TableCell>
                  <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{leave.days}</TableCell>
                  <TableCell>{leave.status}</TableCell>
                  <TableCell>{leave.reason || "-"}</TableCell>
                  <TableCell>
                    {leave.status === "PENDING" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(leave.id)}
                      >
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
