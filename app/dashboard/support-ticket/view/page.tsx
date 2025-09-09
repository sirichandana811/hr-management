"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { useEffect, useState } from "react"

interface Ticket {
  id: string
  title: string
  description: string
  status: string
  priority: string
  createdAt: string
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTickets() {
      try {
        const res = await fetch("/api/support-tickets")
        const data = await res.json()
        setTickets(data)
      } catch (err) {
        console.error("Failed to load tickets:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchTickets()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this ticket?")) return
    try {
      const res = await fetch(`/api/support-tickets/${id}`, { method: "DELETE" })
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== id))
      } else {
        console.error("Failed to delete ticket")
      }
    } catch (err) {
      console.error("Error deleting ticket:", err)
    }
  }

  if (loading) return <p className="p-4">Loading tickets...</p>

  return (
    <DashboardLayout title="Ticket Management">
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Support Tickets</h1>
      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <ul className="space-y-4">
          {tickets.map((ticket) => (
            <li
              key={ticket.id}
              className="border p-4 rounded-md shadow-sm flex justify-between items-start"
            >
              <div>
                <h2 className="text-lg font-semibold">{ticket.title}</h2>
                <p className="text-gray-600">{ticket.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Status: {ticket.status} | Priority: {ticket.priority}
                </p>
              </div>
              {ticket.status === "OPEN" && (
                <button
                  onClick={() => handleDelete(ticket.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
             
            </li>
          ))}
        </ul>
      )}
    </div>
    </DashboardLayout>
  )
}
