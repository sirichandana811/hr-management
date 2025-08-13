"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"

type Employee = {
  id: string
  name: string
  email: string
  role: string
  department?: string
  employeeId?: string
  isActive: boolean
}

export default function EmployeeReportsPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/hr/employee")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        return res.json()
      })
      .then((data) => {
        setEmployees(data.employees)
        setLoading(false)
      })
      .catch((err) => {
        setError("Failed to load employees")
        setLoading(false)
      })
  }, [])

  function downloadCSV() {
    if (employees.length === 0) return
    const headers = ["Name", "Email", "Role", "Department", "Employee ID", "Active"]
    const rows = employees.map((emp) => [
      emp.name,
      emp.email,
      emp.role,
      emp.department || "",
      emp.employeeId || "",
      emp.isActive ? "Yes" : "No",
    ])
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows]
        .map((e) => e.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "employee_reports.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <DashboardLayout title="Employee Reports">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Employee Reports</h1>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : employees.length === 0 ? (
          <p>No employee data available.</p>
        ) : (
          <>
            <p className="mb-4">Total Employees: {employees.length}</p>
            <Button onClick={downloadCSV} className="mb-4">
              Download CSV Report
            </Button>
            <table className="w-full border-collapse border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Name</th>
                  <th className="border px-2 py-1">Email</th>
                  <th className="border px-2 py-1">Role</th>
                  <th className="border px-2 py-1">Department</th>
                  <th className="border px-2 py-1">Employee ID</th>
                  <th className="border px-2 py-1">Active</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="border px-2 py-1">{emp.name}</td>
                    <td className="border px-2 py-1">{emp.email}</td>
                    <td className="border px-2 py-1">{emp.role}</td>
                    <td className="border px-2 py-1">{emp.department || "-"}</td>
                    <td className="border px-2 py-1">{emp.employeeId || "-"}</td>
                    <td className="border px-2 py-1">{emp.isActive ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
