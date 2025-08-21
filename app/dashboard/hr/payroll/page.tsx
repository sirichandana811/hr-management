"use client";

import { useEffect, useState } from "react";
import { Loader2, Pencil, Search } from "lucide-react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Payroll {
  id: string;
  basic: number;
  hra: number;
  allowances: number;
  deductions: number;
  grossSalary: number;
  netSalary: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number | null;
  payroll?: Payroll;
}

export default function PayrollPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    basic: 0,
    hra: 0,
    allowances: 0,
    deductions: 0,
  });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payroll");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch salaries", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      basic: user.payroll?.basic || 0,
      hra: user.payroll?.hra || 0,
      allowances: user.payroll?.allowances || 0,
      deductions: user.payroll?.deductions || 0,
    });
  };

  const handleChange = (field: keyof typeof formData, value: number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch("/api/payroll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingUser.id,
          ...formData,
        }),
      });
      if (res.ok) {
        await fetchSalaries();
        setEditingUser(null);
      }
    } catch (err) {
      console.error("Failed to update salary", err);
    } finally {
      setSaving(false);
    }
  };

  // realtime calculations
  const gross = formData.basic + formData.hra + formData.allowances;
  const net = gross - formData.deductions;

  // filtered list
  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Payroll Management">
      <h1 className="text-2xl font-bold mb-4">Payroll Management</h1>

      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-4">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-gray-500">No matching results found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredUsers.map((user) => (
            <Card key={user.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{user.name || "Unnamed"}</CardTitle>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-sm">{user.role}</p>
                </div>
                <Button variant="outline" onClick={() => handleEdit(user)}>
                  <Pencil className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardHeader>
              <CardContent>
                <p>
                  <b>Net Salary:</b> ₹{user.payroll?.netSalary?.toFixed(2) ?? "Not set"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Salary Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Salary – {editingUser?.name} ({editingUser?.role})
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-3">
            <label>
              Basic
              <Input
                type="number"
                value={formData.basic}
                onChange={(e) => handleChange("basic", Number(e.target.value))}
              />
            </label>
            <label>
              HRA
              <Input
                type="number"
                value={formData.hra}
                onChange={(e) => handleChange("hra", Number(e.target.value))}
              />
            </label>
            <label>
              Allowances
              <Input
                type="number"
                value={formData.allowances}
                onChange={(e) => handleChange("allowances", Number(e.target.value))}
              />
            </label>
            <label>
              Deductions
              <Input
                type="number"
                value={formData.deductions}
                onChange={(e) => handleChange("deductions", Number(e.target.value))}
              />
            </label>

            <div className="p-3 bg-gray-100 rounded-md">
              <p>
                <b>Gross Salary:</b> ₹{gross.toFixed(2)}
              </p>
              <p>
                <b>Net Salary:</b> ₹{net.toFixed(2)}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
