"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";

export default function ApplyLeaveForm({
  balance,
  userId,
}: {
  balance: { CL: number; SL: number; PL: number };
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

    // Calculate number of leave days excluding weekends
    const daysDiff = calculateLeaveDays(startDate, endDate);
    const remaining = type === "CASUAL"
      ? balance.CL
      : type === "SICK"
      ? balance.SL
      : balance.PL;

    if (daysDiff > remaining) {
      alert(`You only have ${remaining} ${type} leaves left.`);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/leaves", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        type,
        startDate,
        endDate,
        reason,
      }),
    });

    setLoading(false);

    if (res.ok) {
      alert("Leave applied successfully");
      router.push("/dashboard/teacher");
    } else {
      const data = await res.json();
      alert(data.error || "Failed to apply");
    }
  };

  return (
    <DashboardLayout title="Apply Leave">
      <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-lg">
        <p className="mb-4">
          CL Left: {balance.CL} | SL Left: {balance.SL} | PL Left: {balance.PL}
        </p>
        <form onSubmit={handleApply} className="space-y-4">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="">Select leave type</option>
            <option value="CASUAL">Casual</option>
            <option value="SICK">Sick</option>
            <option value="PAID">Paid</option>
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={minDate}
            required
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={minDate}
            required
          />

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Apply Leave"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}

function calculateLeaveDays(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);
  let count = 0;

  while (startDate <= endDate) {
    const day = startDate.getDay();
    // Exclude weekends (0=Sunday, 6=Saturday)
    if (day !== 0 && day !== 6) {
      count++;
    }
    startDate.setDate(startDate.getDate() + 1);
  }

  return count;
}
