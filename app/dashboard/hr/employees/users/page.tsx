"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Edit, Trash2 } from "lucide-react";

type UserRole =
  | "TEACHER"
  | "CONTENT_CREATOR"
  | "SUPPORT_STAFF"
  | "EMPLOYEE"
  | "HR"
  | "ADMIN";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: UserRole | null;
  department: string | null;
  employeeId: string | null;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50; // how many users per page

  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  useEffect(() => {
    fetchUsers();
  }, [page]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/hr/users?page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();

      // Exclude HR and ADMIN users
      const filtered = data.users.filter(
        (user: User) => user.role !== "HR" && user.role !== "ADMIN"
      );

      setUsers(filtered);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function handleDelete(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`/api/hr/users/${userId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      await fetchUsers();
      alert("User deleted successfully");
    } catch (error) {
      alert("Failed to delete user");
    }
  }

  return (
    <DashboardLayout title="User Management">
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Employee Management</h1>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => router.push("/dashboard/hr")}
              className="bg-gray-500 hover:bg-gray-600 text-white"
            >
              Back
            </Button>
            <Link href="/dashboard/hr/employees/users/new" passHref prefetch>
              <Button>Create New User</Button>
            </Link>
          </div>
        </div>

        {message && (
          <Alert
            variant="default"
            className="mb-4 border-green-500 bg-green-100 text-green-800"
          >
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <Input
          type="search"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md mb-4"
        />

        {loading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center text-gray-500">No users found.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || "-"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role || "-"}</TableCell>
                    <TableCell>{user.department || "-"}</TableCell>
                    <TableCell>{user.employeeId || "-"}</TableCell>
                    <TableCell>{user.isActive ? "Yes" : "No"}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/dashboard/hr/employees/users/${user.id}/edit`
                          )
                        }
                        title="Edit user"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(user.id)}
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6 space-x-2">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-4 py-2">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
