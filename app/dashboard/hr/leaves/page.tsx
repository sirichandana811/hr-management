"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Leave {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
}

export default function HrLeaveManagementPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leaves/all", { method: "GET" });
      const data = await res.json();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleAction = async (leaveId: string, action: "approve" | "reject") => {
    setProcessingId(leaveId);
    try {
      const res = await fetch("/api/leaves/handle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to process leave");
      } else {
        alert(data.message);
        fetchLeaves();
      }
    } catch (e) {
      alert("Server error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelApproved = async (leaveId: string) => {
    if (!confirm("Cancel this approved leave?")) return;
    setProcessingId(leaveId);
    try {
      const res = await fetch("/api/leaves/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to cancel leave");
      } else {
        alert(data.message || "Leave canceled");
        fetchLeaves();
      }
    } catch (e) {
      alert("Server error");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const search = searchTerm.toLowerCase();
    return (
      leave.userName.toLowerCase().includes(search) ||
      leave.userEmail.toLowerCase().includes(search) ||
      leave.type.toLowerCase().includes(search) ||
      leave.status.toLowerCase().includes(search)
    );
  });

  if (loading) return <p>Loading leave requests...</p>;
  if (leaves.length === 0) return <p>No leave requests found.</p>;

  return (
    <DashboardLayout title="HR DASHBOARD">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Leave Requests & History</h1>
          <button
            onClick={() => router.back()}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>

        {/* Search box */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by name, email, type, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 px-3 py-2 rounded w-full md:w-1/3"
          />
        </div>

        <table className="w-full border border-gray-300 border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">User</th>
              <th className="border p-2">Email</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Start Date</th>
              <th className="border p-2">End Date</th>
              <th className="border p-2">Reason</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.map((leave) => (
              <tr key={leave.id}>
                <td className="border p-2">{leave.userName}</td>
                <td className="border p-2">{leave.userEmail}</td>
                <td className="border p-2">{leave.type}</td>
                <td className="border p-2">{new Date(leave.startDate).toLocaleDateString()}</td>
                <td className="border p-2">{new Date(leave.endDate).toLocaleDateString()}</td>
                <td className="border p-2">{leave.reason}</td>
                <td className="border p-2">{leave.status}</td>
                <td className="border p-2 flex gap-2">
                  {leave.status === "PENDING" && (
                    <>
                      <button
                        disabled={processingId === leave.id}
                        onClick={() => handleAction(leave.id, "approve")}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        disabled={processingId === leave.id}
                        onClick={() => handleAction(leave.id, "reject")}
                        className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {leave.status === "APPROVED" && (
                    <button
                      disabled={processingId === leave.id}
                      onClick={() => handleCancelApproved(leave.id)}
                      className="bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  )}
                  {(leave.status === "REJECTED" || leave.status === "CANCELLED") && (
                    <span className="text-gray-500">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
