"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

const roleOptions = [
  { value: "ADMIN", label: "Administrator" },
  { value: "HR", label: "Human Resources" },
  { value: "TEACHER", label: "Teacher" },
 
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
  dateOfJoining: string | null; // ISO string
  isActive: boolean;
  skills: string[]; // ✅ Added
}

export default function EditUserPage({ params }: { params: { userId: string } }) {
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    employeeId: "",
    phoneNumber: "",
    address: "",
    dateOfJoining: "",
    isActive: true,
    skills: [] as string[], // ✅ Added
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
      if (response.ok) {
        const userData: User = await response.json();
        setUser(userData);

        setFormData({
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
          isActive: userData.isActive,
          skills: userData.skills || [], // ✅ Added
        });
      } else {
        setError("Failed to load user data");
      }
    } catch (error) {
      setError("Failed to load user data");
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/hr/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || null,
          email: formData.email,
          role: formData.role || null,
          department: formData.department || null,
          employeeId: formData.employeeId || null,
          phoneNumber: formData.phoneNumber || null,
          address: formData.address || null,
          dateOfJoining: formData.dateOfJoining
            ? new Date(formData.dateOfJoining)
            : null,
          isActive: formData.isActive,
          skills: formData.skills, // ✅ Added
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "An error occurred");
        return;
      }

      router.push("/dashboard/hr/employees/users?message=User updated successfully");
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoadingUser) {
    return (
      <DashboardLayout title="Edit User">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout title="Edit User">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard/admin/users">Back to Users</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit User">
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
            <p className="text-gray-600">Update user information and settings</p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Update the user's account details</CardDescription>
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
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("employeeId", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
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

              {/* Date of Joining */}
              <div className="space-y-2">
                <Label htmlFor="dateOfJoining">Date of Joining</Label>
                <Input
                  id="dateOfJoining"
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) =>
                    handleInputChange("dateOfJoining", e.target.value)
                  }
                />
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  type="text"
                  placeholder="Enter skills separated by commas (e.g. React, Node.js, SQL)"
                  value={formData.skills.join(", ")}
                  onChange={(e) =>
                    handleInputChange(
                      "skills",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s.length > 0)
                    )
                  }
                />
              </div>

              {/* Active Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive", checked)
                  }
                />
                <Label htmlFor="isActive">Active User</Label>
              </div>

              {/* Submit buttons */}
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update User
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Password Reset Card */}
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Set a new password for this user</CardDescription>
          </CardHeader>
          <CardContent>
            {passwordError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}
            {passwordSuccess && (
              <Alert className="mb-4">
                <AlertDescription>{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setPasswordError("");
                setPasswordSuccess("");

                if (passwordData.newPassword !== passwordData.confirmPassword) {
                  setPasswordError("Passwords do not match");
                  return;
                }

                if (!passwordData.newPassword) {
                  setPasswordError("Password cannot be empty");
                  return;
                }

                setIsPasswordLoading(true);
                try {
                  const res = await fetch(
                    `/api/hr/users/${userId}/reset-password`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ newPassword: passwordData.newPassword }),
                    }
                  );

                  const data = await res.json();
                  if (!res.ok) {
                    setPasswordError(data.error || "Failed to reset password");
                    return;
                  }
                  setPasswordSuccess("Password reset successfully");
                  setPasswordData({ newPassword: "", confirmPassword: "" });
                } catch {
                  setPasswordError("An error occurred. Please try again.");
                } finally {
                  setIsPasswordLoading(false);
                }
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={isPasswordLoading}>
                {isPasswordLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
