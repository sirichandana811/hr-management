import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { Users, HelpCircle, TrendingUp, CalendarCheck, ClipboardCheck, FileText } from "lucide-react"
import Link from "next/link"

async function getAdminStats() {
  const [totalUsers, openTickets, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.supportTicket.count({
      where: { status: { in: ["OPEN"] } },
    }),
    prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: {
      role: true,
    },
  })

  return {
    totalUsers,
    openTickets,
    recentUsers,
    usersByRole,
  }
}

export default async function AdminDashboard() {
  await requireRole(["ADMIN"])
  const stats = await getAdminStats()

  const roleLabels = {
    ADMIN: "Administrators",
    HR: "HR Staff",
    TEACHER: "Teachers",
    CONTENT_CREATOR: "Content Creators",
    SUPPORT_STAFF: "Support Staff",
    EMPLOYEE: "Employees",
  }

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Overview of system statistics and management tools</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active system users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openTickets}</div>
              <Link href="/dashboard/support-ticket" className="text-xs text-muted-foreground">
                Pending support tickets
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Users (30d)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentUsers}</div>
              <p className="text-xs text-muted-foreground">Users joined this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link href="/dashboard/admin/users">
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add, edit, or remove users</CardDescription>
              </CardHeader>
              <CardContent>
                <Users className="h-6 w-6 text-blue-500" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/leave-management">
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardHeader>
                <CardTitle>Leave Management</CardTitle>
                <CardDescription>Manage employee leaves</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarCheck className="h-6 w-6 text-green-500" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/admin/attendance">
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardHeader>
                <CardTitle>Attendance</CardTitle>
                <CardDescription>Track employee attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <ClipboardCheck className="h-6 w-6 text-yellow-500" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/support-ticket">
            <Card className="hover:bg-gray-50 cursor-pointer">
              <CardHeader>
                <CardTitle>Ticket Management</CardTitle>
                <CardDescription>View and resolve support tickets</CardDescription>
              </CardHeader>
              <CardContent>
                <FileText className="h-6 w-6 text-red-500" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Users by Role (moved to bottom) */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>Distribution of users across different roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.usersByRole.map((roleGroup) => (
                <div key={roleGroup.role} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium">
                      {roleGroup.role ? roleLabels[roleGroup.role as keyof typeof roleLabels] : "No Role"}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">{roleGroup._count.role}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
