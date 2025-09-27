
import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { Download, FileText, Users, BookOpen, HelpCircle } from "lucide-react"

async function getReportData() {
  const [userStats, ticketStats] = await Promise.all([
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
    
    prisma.supportTicket.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ])

  return { userStats, ticketStats }
}

export default async function ReportsPage() {
  await requireRole(["ADMIN"])
  const reportData = await getReportData()

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">System Reports</h1>
            <p className="text-gray-600">Generate and view detailed system reports</p>
          </div>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export All Reports
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Quick Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Report</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.userStats.length}</div>
                <p className="text-xs text-muted-foreground">Different user roles</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </CardContent>
            </Card>

           

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Support Report</CardTitle>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.ticketStats.length}</div>
                <p className="text-xs text-muted-foreground">Ticket statuses</p>
                <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
              <CardDescription>Generate detailed reports for different aspects of the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">User Activity Report</h3>
                    <p className="text-sm text-gray-600">Detailed user login and activity statistics</p>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Course Enrollment Report</h3>
                    <p className="text-sm text-gray-600">Course enrollment statistics and trends</p>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Support Ticket Analysis</h3>
                    <p className="text-sm text-gray-600">Support ticket resolution times and categories</p>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">System Performance Report</h3>
                    <p className="text-sm text-gray-600">System usage and performance metrics</p>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
