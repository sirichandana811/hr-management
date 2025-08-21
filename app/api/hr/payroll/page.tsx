"use client";

import { useEffect, useState } from "react";

export default function PayrollPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSalary, setNewSalary] = useState<number>(0);

  useEffect(() => {
    fetch("/api/payroll")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const handleEdit = (id: string, currentSalary: number) => {
    setEditingId(id);
    setNewSalary(currentSalary);
  };

  const handleSave = async (id: string) => {
    const res = await fetch("/api/payroll", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, salary: newSalary }),
    });

    if (res.ok) {
      const updated = await res.json();
      setUsers(users.map((u) => (u.id === id ? updated : u)));
      setEditingId(null);
    }
  };

  if (loading) return <p className="p-4">Loading payroll...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Management</h1>

      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Salary</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border p-2">{u.name}</td>
              <td className="border p-2">{u.email}</td>
              <td className="border p-2">{u.role}</td>
              <td className="border p-2">
                {editingId === u.id ? (
                  <input
                    type="number"
                    value={newSalary}
                    onChange={(e) => setNewSalary(Number(e.target.value))}
                    className="border px-2 py-1 w-24"
                  />
                ) : (
                  `₹${u.salary}`
                )}
              </td>
              <td className="border p-2">
                {editingId === u.id ? (
                  <button
                    onClick={() => handleSave(u.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(u.id, u.salary)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
