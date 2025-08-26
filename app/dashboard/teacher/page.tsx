import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { BookOpen, FileText, ClipboardList } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

// ====== Get Teacher Leaves ======
async function getTeacherLeaves(userId: string) {
  const leaves = await prisma.leaveRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  })

  const pending = leaves.filter(l => l.status === "PENDING").length
  const approved = leaves.filter(l => l.status === "APPROVED").length
  const rejected = leaves.filter(l => l.status === "REJECTED").length

  return { recentLeaves: leaves, pending, approved, rejected }
}

export default async function TeacherDashboard() {
  await requireRole(["TEACHER", "ADMIN"])
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  const leaveStats = await getTeacherLeaves(userId)

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
          <p className="text-gray-600">Manage your students, attendance, and leave requests</p>
        </div>

        {/* Stats Cards */}
        

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Leave Requests</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs">Pending: {leaveStats.pending}</p>
              <p className="text-xs">Approved: {leaveStats.approved}</p>
              <p className="text-xs">Rejected: {leaveStats.rejected}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Topic Management
              </CardTitle>
              <CardDescription>Create and manage your topics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start">
                  <Link href="/dashboard/teacher/teacher-log">Enter New Topic</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/teacher/teacher-log/view">View All Topics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Ticket Management
              </CardTitle>
              <CardDescription>Create and manage support tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start">
                  <Link href="/dashboard/support-ticket">Create Ticket</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/support-ticket/view">View All Tickets</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>Apply and track your leaves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start">
                  <Link href="/dashboard/teacher/leaves/apply">Apply for Leave</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/teacher/leaves/history">View Leave History</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/teacher/leaves/types">View Leave Types</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Link href="/dashboard/teacher/holidays">View Holidays</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ClipboardList className="mr-2 h-5 w-5" />
                Attendance Management
              </CardTitle>
              <CardDescription>Track your attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start">
                  <Link href="/dashboard/teacher/attendance">View Attendance</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leaves */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Requests</CardTitle>
            <CardDescription>Your last 5 leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            {leaveStats.recentLeaves.length > 0 ? (
              <div className="space-y-4">
                {leaveStats.recentLeaves.map(leave => (
                  <div key={leave.id} className="flex justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{leave.leaveTypeName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        leave.status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : leave.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No leave requests yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

