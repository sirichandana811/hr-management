"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { useEffect, useState } from "react";

interface Payroll {
  id: string;
  userId: string;
  baseSalary: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
}

export default function PayrollPage() {
  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ Replace with actual logged-in user ID from session/auth
  const userId = "teacher1";  

  useEffect(() => {
    const fetchPayroll = async () => {
      try {
        const res = await fetch(`/api/payroll/view?userId=${userId}`);
        const data = await res.json();
        if (res.ok) setPayroll(data);
      } catch (err) {
        console.error("Error fetching payroll:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayroll();
  }, []);

  if (loading) return <p className="p-4">Loading payroll...</p>;
  if (!payroll) return <p className="p-4">No payroll details found.</p>;

  return (
    <DashboardLayout title="Payroll Management">
    <div className="p-6 max-w-lg mx-auto bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-4">Your Payroll Details</h2>
      <ul className="space-y-2">
        <li><strong>Base Salary:</strong> ₹{payroll.basic}</li>
        <li><strong>HRA:</strong> ₹{payroll.hra}</li>
        <li><strong>Allowances:</strong> ₹{payroll.allowances}</li>
        <li><strong>Deductions:</strong> ₹{payroll.deductions}</li>
        <li className="font-bold text-green-600">
          Net Salary: ₹{payroll.netSalary}
        </li>
      </ul>
    </div>
    </DashboardLayout>
  );
}
