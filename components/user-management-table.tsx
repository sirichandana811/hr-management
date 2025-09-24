"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import { useRouter } from "next/navigation"
import type { UserRole } from "@prisma/client"

interface User {
  id: string
  name: string | null
  email: string
  role: UserRole | null
  department: string | null
  employeeId: string | null
  isActive: boolean
  createdAt: Date
}

interface UserManagementTableProps {
  users: User[]
}

export function UserManagementTable({ users }: UserManagementTableProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const router = useRouter()

  const roleLabels = {
    ADMIN: "Administrator",
    HR: "HR Staff",
    TEACHER: "Teacher",
    EMPLOYEE: "Employee",
  }

  const getRoleBadgeVariant = (role: UserRole | null) => {
    switch (role) {
      case "ADMIN":
        return "destructive"
      case "HR":
        return "default"
      case "TEACHER":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setIsLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
    } finally {
      setIsLoading(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    setIsLoading(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting user:", error)
    } finally {
      setIsLoading(null)
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Employee ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="w-[70px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name || "N/A"}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role ? (
                  <Badge variant={getRoleBadgeVariant(user.role)}>{roleLabels[user.role]}</Badge>
                ) : (
                  <Badge variant="outline">No Role</Badge>
                )}
              </TableCell>
              <TableCell>{user.department || "N/A"}</TableCell>
              <TableCell>{user.employeeId || "N/A"}</TableCell>
              <TableCell>
                <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Active" : "Inactive"}</Badge>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/admin/users/${user.id}/edit`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit User
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleToggleStatus(user.id, user.isActive)}
                      disabled={isLoading === user.id}
                    >
                      {user.isActive ? (
                        <>
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={isLoading === user.id}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete User
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
