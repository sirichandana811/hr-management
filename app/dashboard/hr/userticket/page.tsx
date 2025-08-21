"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useEffect, useState } from "react";

export default function AdminTicketPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hr/userticket")
      .then((res) => res.json())
      .then((data) => {
        setTickets(data);
        setLoading(false);
      });
  }, []);

  const handleAction = async (id: string, action: string, value: string) => {
    try {
      const res = await fetch(`/api/hr/userticket/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [action]: value }),
      });

      if (!res.ok) throw new Error("Failed to update ticket");
      const updated = await res.json();

      setTickets((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update ticket");
    }
  };

  if (loading) return <p>Loading tickets...</p>;

  return (
    <DashboardLayout title="ticket management">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Support Tickets</h1>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="border p-4 rounded-lg shadow">
              <h2 className="font-semibold text-lg">Title: {ticket.title}</h2>
              <p className="text-gray-600">Description: {ticket.description}</p>
              <p className="text-sm text-gray-500">By: {ticket.user?.name} ({ticket.user?.email})</p>

            <div className="mt-3 flex gap-3">
              {/* Status Dropdown */}
              <select
                value={ticket.status}
                onChange={(e) => handleAction(ticket.id, "status", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>

              {/* Priority Dropdown */}
              <select
                value={ticket.priority}
                onChange={(e) => handleAction(ticket.id, "priority", e.target.value)}
                className="border p-2 rounded"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
    </DashboardLayout>
  );
}
