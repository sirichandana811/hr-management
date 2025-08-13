import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { User, Calendar, HelpCircle, FileText, Clock } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function getEmployeeData(userId: string) {
  const [user, myTickets] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        role: true,
        department: true,
        employeeId: true,
        dateOfJoining: true,
      },
    }),
    prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return { user, myTickets }
}

export default async function EmployeeDashboard() {
  await requireRole(["EMPLOYEE", "ADMIN", "HR", "TEACHER", "CONTENT_CREATOR", "SUPPORT_STAFF"])
  const session = await getServerSession(authOptions)
  const { user, myTickets } = await getEmployeeData(session!.user.id)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="destructive">Open</Badge>
      case "IN_PROGRESS":
        return <Badge variant="default">In Progress</Badge>
      case "RESOLVED":
        return <Badge variant="secondary">Resolved</Badge>
      case "CLOSED":
        return <Badge variant="outline">Closed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <DashboardLayout title="Employee Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-gray-600">Your personal dashboard and profile</p>
        </div>

        {/* Profile Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Your account details and employment information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-lg">{user?.name || "Not provided"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{user?.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Role</label>
                  <p className="text-lg">
                    {user?.role
                      ?.replace("_", " ")
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase()) || "Not assigned"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-lg">{user?.department || "Not assigned"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="text-lg">{user?.employeeId || "Not assigned"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Joining</label>
                  <p className="text-lg">
                    {user?.dateOfJoining ? new Date(user.dateOfJoining).toLocaleDateString() : "Not available"}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <Button>Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Time & Attendance
              </CardTitle>
              <CardDescription>Track your work hours and attendance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Clock className="mr-2 h-4 w-4" />
                  Clock In/Out
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  View Timesheet
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Request Leave
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                Support & Help
              </CardTitle>
              <CardDescription>Get help and submit support requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start">Create Support Ticket</Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  View My Tickets
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Help Center
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Documents & Forms
              </CardTitle>
              <CardDescription>Access important documents and forms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Employee Handbook
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Pay Stubs
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Benefits Information
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Support Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>My Support Tickets</CardTitle>
            <CardDescription>Your recent support requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{ticket.description}</p>
                    <p className="text-xs text-gray-500">Created {new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              ))}
              {myTickets.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No support tickets found. Create a ticket if you need assistance.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
