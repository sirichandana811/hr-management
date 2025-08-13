"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { UserRole } from "@prisma/client";
import { useParams } from "next/navigation";

const roleOptions: { value: UserRole; label: string }[] = [
  { value: "TEACHER", label: "Teacher" },
  { value: "CONTENT_CREATOR", label: "Content Creator" },
  { value: "SUPPORT_STAFF", label: "Support Staff" },
  { value: "EMPLOYEE", label: "Employee" },
];

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole | null;
  department: string | null;
  employeeId: string | null;
  phoneNumber: string | null;
  address: string | null;
  dateOfJoining: string | null;
  salary: number | null;
  isActive: boolean;
  maxCL: number;
  usedCL: number;
  maxSL: number;
  usedSL: number;
  maxPL: number;
  usedPL: number;
}

export default function EditEmployeePage({
  params,
}: {
  params: { userId: string };
}) {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    role: "",
    department: "",
    employeeId: "",
    phoneNumber: "",
    address: "",
    dateOfJoining: "",
    salary: "",
    isActive: true,
    maxCL: 20,
    usedCL: 0,
    maxSL: 20,
    usedSL: 0,
    maxPL: 20,
    usedPL: 0,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const router = useRouter();
  const { userId } = useParams() as { userId: string };

  useEffect(() => {
    if (!userId) return;
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/hr/users/${userId}`);
      if (!response.ok) throw new Error("Failed to load user data");

      const userData: User = await response.json();
      setUser(userData);

      setFormData({
        id: userData.id || "",
        name: userData.name || "",
        email: userData.email,
        role: userData.role || "",
        department: userData.department || "",
        employeeId: userData.employeeId || "",
        phoneNumber: userData.phoneNumber || "",
        address: userData.address || "",
        dateOfJoining: userData.dateOfJoining
          ? new Date(userData.dateOfJoining).toISOString().substring(0, 10)
          : "",
        salary: userData.salary !== null ? userData.salary.toString() : "",
        isActive: userData.isActive,
        maxCL: userData.maxCL ?? 20,
        usedCL: userData.usedCL ?? 0,
        maxSL: userData.maxSL ?? 20,
        usedSL: userData.usedSL ?? 0,
        maxPL: userData.maxPL ?? 20,
        usedPL: userData.usedPL ?? 0,
      });
    } catch {
      setError("Failed to load user data");
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate numeric fields
    if (
      Number(formData.maxCL) < 0 ||
      Number(formData.usedCL) < 0 ||
      Number(formData.maxSL) < 0 ||
      Number(formData.usedSL) < 0 ||
      Number(formData.maxPL) < 0 ||
      Number(formData.usedPL) < 0 ||
      Number(formData.salary) < 0
    ) {
      setError("Numeric fields cannot be negative");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/hr/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name || null,
          role: formData.role || null,
          department: formData.department || null,
          employeeId: formData.employeeId || null,
          phoneNumber: formData.phoneNumber || null,
          address: formData.address || null,
          dateOfJoining: formData.dateOfJoining
            ? new Date(formData.dateOfJoining)
            : null,
          salary: formData.salary !== "" ? parseFloat(formData.salary) : null,
          maxCL: Number(formData.maxCL),
          usedCL: Number(formData.usedCL),
          maxSL: Number(formData.maxSL),
          usedSL: Number(formData.usedSL),
          maxPL: Number(formData.maxPL),
          usedPL: Number(formData.usedPL),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update user");
        return;
      }

      router.push("/dashboard/hr/employees/users?message=User updated successfully");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoadingUser) {
    return (
      <DashboardLayout title="Edit Employee">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Edit Employee">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/hr/users">Back to Users</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Employee">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/hr/employees/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
            <p className="text-gray-600">Update employee information and settings</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
            <CardDescription>Update the employee's account details</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name, Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Role, Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleInputChange("role", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    type="text"
                    placeholder="Enter department"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                  />
                </div>
              </div>

              {/* Employee ID, Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Employee ID</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="Enter employee ID"
                    value={formData.employeeId}
                    onChange={(e) => handleInputChange("employeeId", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="Enter address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                />
              </div>

              {/* Date of Joining, Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfJoining">Date of Joining</Label>
                  <Input
                    id="dateOfJoining"
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => handleInputChange("dateOfJoining", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="Enter salary"
                    value={formData.salary}
                    onChange={(e) => handleInputChange("salary", e.target.value)}
                  />
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Active Employee</Label>
              </div>

              {/* Leave Balances */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxCL">Max Casual Leaves</Label>
                  <Input
                    id="maxCL"
                    type="number"
                    min={0}
                    value={formData.maxCL}
                    onChange={(e) => handleInputChange("maxCL", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usedCL">Used Casual Leaves</Label>
                  <Input
                    id="usedCL"
                    type="number"
                    min={0}
                    value={formData.usedCL}
                    onChange={(e) => handleInputChange("usedCL", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxSL">Max Sick Leaves</Label>
                  <Input
                    id="maxSL"
                    type="number"
                    min={0}
                    value={formData.maxSL}
                    onChange={(e) => handleInputChange("maxSL", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usedSL">Used Sick Leaves</Label>
                  <Input
                    id="usedSL"
                    type="number"
                    min={0}
                    value={formData.usedSL}
                    onChange={(e) => handleInputChange("usedSL", Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPL">Max Paid Leaves</Label>
                  <Input
                    id="maxPL"
                    type="number"
                    min={0}
                    value={formData.maxPL}
                    onChange={(e) => handleInputChange("maxPL", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usedPL">Used Paid Leaves</Label>
                  <Input
                    id="usedPL"
                    type="number"
                    min={0}
                    value={formData.usedPL}
                    onChange={(e) => handleInputChange("usedPL", Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Employee
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
