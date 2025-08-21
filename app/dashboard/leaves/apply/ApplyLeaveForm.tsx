"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";

type LeaveBalance = { CL: number; SL: number; PL: number };

export default function ApplyLeaveForm({
  balance,
  userId,
}: {
  balance: LeaveBalance;
  userId: string;
}) {
  const router = useRouter();
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const minDate = new Date().toISOString().split("T")[0];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();

    const daysDiff = calculateLeaveDays(startDate, endDate);
    const remaining =
      type === "CASUAL" ? balance.CL : type === "SICK" ? balance.SL : balance.PL;

    if (daysDiff > remaining) {
      alert(`You only have ${remaining} ${type} leave(s) remaining.`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, type, startDate, endDate, reason }),
    });
    setLoading(false);

    if (res.ok) {
      alert("Leave applied successfully");
      router.push("/dashboard/teacher");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to apply leave");
    }
  };

  return (
    <DashboardLayout title="Apply Leave">
      <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-lg space-y-6">
        {/* Leave Balance */}
        <div className="text-sm text-gray-700">
          <strong>Leave Balance:</strong> CL: {balance.CL}, SL: {balance.SL}, PL:{" "}
          {balance.PL}
        </div>

        {/* Leave Form */}
        <form onSubmit={handleApply} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Leave Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded"
            >
              <option value="">-- Select Leave Type --</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="PAID">Paid Leave</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || minDate}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Reason</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter the reason for leave"
              required
              className="w-full border px-3 py-2 rounded resize-none"
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? "Submitting..." : "Apply Leave"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

// Calculate leave days excluding weekends
function calculateLeaveDays(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;

  while (startDate <= endDate) {
    const day = startDate.getDay();
    if (day !== 0 && day !== 6) count++; // Exclude Sunday & Saturday
    startDate.setDate(startDate.getDate() + 1);
  }

  return count;
}
