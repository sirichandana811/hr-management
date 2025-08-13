import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { prisma } from "@/lib/prisma"
import { HelpCircle, Clock, CheckCircle, AlertTriangle, Users, FileText } from "lucide-react"

async function getSupportStats() {
  const [openTickets, inProgressTickets, resolvedTickets, urgentTickets] = await Promise.all([
    prisma.supportTicket.count({
      where: { status: "OPEN" },
    }),
    prisma.supportTicket.count({
      where: { status: "IN_PROGRESS" },
    }),
    prisma.supportTicket.count({
      where: { status: "RESOLVED" },
    }),
    prisma.supportTicket.count({
      where: { priority: "URGENT" },
    }),
  ])

  return {
    openTickets,
    inProgressTickets,
    resolvedTickets,
    urgentTickets,
    totalTickets: openTickets + inProgressTickets + resolvedTickets,
  }
}

async function getRecentTickets() {
  return await prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
    },
  })
}

export default async function SupportDashboard() {
  await requireRole(["SUPPORT_STAFF", "ADMIN"])
  const stats = await getSupportStats()
  const recentTickets = await getRecentTickets()

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>
      case "HIGH":
        return <Badge variant="default">High</Badge>
      case "MEDIUM":
        return <Badge variant="secondary">Medium</Badge>
      case "LOW":
        return <Badge variant="outline">Low</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  return (
    <DashboardLayout title="Support Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Support Dashboard</h1>
          <p className="text-gray-600">Manage support tickets and user assistance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openTickets}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inProgressTickets}</div>
              <p className="text-xs text-muted-foreground">Being worked on</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.resolvedTickets}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.urgentTickets}</div>
              <p className="text-xs text-muted-foreground">High priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="mr-2 h-5 w-5" />
                Ticket Management
              </CardTitle>
              <CardDescription>Handle support requests and tickets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start">View All Tickets</Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Urgent Tickets
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  My Assigned Tickets
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5" />
                User Support
              </CardTitle>
              <CardDescription>Assist users with their issues</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  User Issues
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Account Problems
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Technical Support
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>Manage help articles and documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  View Articles
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Create Article
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  FAQ Management
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
            <CardDescription>Latest support requests from users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium">{ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{ticket.description}</p>
                    <p className="text-xs text-gray-500">
                      From: {ticket.user.name} ({ticket.user.email}) • {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                    <Button size="sm">Respond</Button>
                  </div>
                </div>
              ))}
              {recentTickets.length === 0 && (
                <p className="text-center text-gray-500 py-8">No support tickets found.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
