"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Leave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

export default function LeaveHistoryPage() {
  const { data: session, status } = useSession();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const router = useRouter();

  // Fetch leaves only if user is logged in
  const fetchLeaves = async (userId: string) => {
    try {
      const res = await fetch(`/api/leaves/history?userId=${userId}`);
      const data = await res.json();

      // Defensive check: data might not be an array
      if (Array.isArray(data)) {
        setLeaves(data);
      } else {
        console.warn("Leave history API did not return an array");
        setLeaves([]);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      setLeaves([]);
    } finally {
      setLoading(false);
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetchLeaves(session.user.id);
    } else if (status === "unauthenticated") {
      // If unauthenticated, redirect or show a message
      router.push("/auth/signin");
    }
  }, [status, session?.user?.id, router]);

  const handleCancel = async (leaveId: string) => {
    if (!confirm("Are you sure you want to cancel this leave?")) return;
    setCancellingId(leaveId);

    try {
      const res = await fetch("/api/leaves/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to cancel leave.");
      } else {
        alert(data.message || "Leave cancelled.");
        if (session?.user?.id) {
          fetchLeaves(session.user.id);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Server error while cancelling leave.");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) return <p>Loading leave history...</p>;

  return (
    <DashboardLayout title="Leave History">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Leave History</h1>
          <button
            onClick={() => router.push("/dashboard/teacher")}
            className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>

        {leaves.length === 0 ? (
          <p>No leave records found.</p>
        ) : (
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Type</th>
                <th className="border p-2">Start Date</th>
                <th className="border p-2">End Date</th>
                <th className="border p-2">Reason</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td className="border p-2">{leave.type}</td>
                  <td className="border p-2">
                    {new Date(leave.startDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">
                    {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="border p-2">{leave.reason}</td>
                  <td className="border p-2">{leave.status}</td>
                  <td className="border p-2">
                     {leave.status === "PENDING" ? (
    <button
      disabled={cancellingId === leave.id}
      onClick={() => handleCancel(leave.id)}
      className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700 disabled:opacity-50"
    >
      {cancellingId === leave.id ? "Cancelling..." : "Cancel"}
    </button>
  ) : (
    <span className="text-gray-500">-</span>
  )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}
