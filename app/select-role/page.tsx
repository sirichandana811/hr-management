"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { UserRole } from "@prisma/client"

const roleOptions = [
  { value: "ADMIN", label: "Administrator" },
  { value: "HR", label: "Human Resources" },
  { value: "TEACHER", label: "Teacher" },
  { value: "EMPLOYEE", label: "Employee" },
]

export default function SelectRolePage() {
  const { data: session, status, update } = useSession()
  const [selectedRole, setSelectedRole] = useState("")
  const [department, setDepartment] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (session.user?.role) {
      // User already has a role, redirect to appropriate dashboard
      const roleRoutes = {
        ADMIN: "/dashboard/admin",
        HR: "/dashboard/hr",
        TEACHER: "/dashboard/teacher",
        CONTENT_CREATOR: "/dashboard/content",
        SUPPORT_STAFF: "/dashboard/support",
        EMPLOYEE: "/dashboard/employee",
      }
      router.push(roleRoutes[session.user.role])
    }
  }, [session, status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!selectedRole) {
      setError("Please select a role")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: selectedRole as UserRole,
          department: department || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "An error occurred")
        return
      }

      // Update the session
      await update()

      // Redirect based on selected role
      const roleRoutes = {
        ADMIN: "/dashboard/admin",
        HR: "/dashboard/hr",
        TEACHER: "/dashboard/teacher",
        CONTENT_CREATOR: "/dashboard/content",
        SUPPORT_STAFF: "/dashboard/support",
        EMPLOYEE: "/dashboard/employee",
      }
      router.push(roleRoutes[selectedRole as UserRole])
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Select Your Role</CardTitle>
          <CardDescription className="text-center">
            Choose your role to access the appropriate dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
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
              <Label htmlFor="department">Department (Optional)</Label>
              <Input
                id="department"
                type="text"
                placeholder="Enter your department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
