import { requireRole } from "@/lib/auth-utils";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { Users, Calendar, DollarSign, TrendingUp, UserCheck, Clock, FileText } from "lucide-react";
import Link from "next/link";

async function getHRStats() {
  const [totalEmployees, activeEmployees, pendingRequests, recentHires, pendingLeaves, approvedLeaves, rejectedLeaves] =
    await Promise.all([
      prisma.user.count({
        where: { role: { notIn: ["ADMIN", "HR"] } },
      }),
      prisma.user.count({
        where: {
          role: { notIn: ["ADMIN", "HR"] },
          isActive: true,
        },
      }),
      prisma.supportTicket.count({
        where: { status: "OPEN", user: { role: "TEACHER" } },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
      prisma.leaveRequest.count({
        where: { status: "PENDING" },
      }),
      prisma.leaveRequest.count({
        where: { status: "APPROVED" },
      }),
      prisma.leaveRequest.count({
        where: { status: "REJECTED" },
      }),
    ]);

  return {
    totalEmployees,
    activeEmployees,
    pendingRequests,
    recentHires,
    pendingLeaves,
    approvedLeaves,
    rejectedLeaves,
  };
}

export default async function HRDashboard() {
  await requireRole(["HR", "ADMIN"]);
  const stats = await getHRStats();

  return (
    <DashboardLayout title="HR Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
          <p className="text-gray-600">Manage employees, HR operations, and leave requests</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">All registered employees</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEmployees}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Support Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires (7d)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentHires}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          {/* Leave Stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingLeaves}</div>
              <p className="text-xs text-muted-foreground">Needs approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedLeaves}</div>
              <p className="text-xs text-muted-foreground">Currently approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Leaves</CardTitle>
              <FileText className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejectedLeaves}</div>
              <p className="text-xs text-muted-foreground">Rejected requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Employee Management
              </CardTitle>
              <CardDescription>Manage employee records and information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/employees/users" prefetch>View All Employees</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/newEmployee" prefetch>Add New Employee</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>Track attendance and manage leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/leave-types" prefetch>Add Leave Type</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/leaves" prefetch>Leave Requests</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/holidays" prefetch>Holiday Calendar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Reviews
              </CardTitle>
              <CardDescription>Reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/reviews/new" prefetch>+ Write review</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/reviews" prefetch>Reviews Summary</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Attendance
              </CardTitle>
              <CardDescription>Attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/attendance" prefetch>Give Attendance</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/attendance/all" prefetch>Attendance History</Link>
                </Button>
                 <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/attendance/view" prefetch>View Attendance</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Ticket Management
              </CardTitle>
              <CardDescription>Manage employee tickets and requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/support-ticket" prefetch>+ Create Ticket</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/support-ticket/view" prefetch>View All Tickets</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/hr/userticket" prefetch>Resolve Tickets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Teacher-log Management
              </CardTitle>
              <CardDescription>Manage employee teacher logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/teacher-log-view" prefetch>View All Topic</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
