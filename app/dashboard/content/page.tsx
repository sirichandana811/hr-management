import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { FileText, Video, ImageIcon, BookOpen, Plus, Upload } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

async function getContentStats(userId: string) {
  const [articles, videos, leaves, courses] = await Promise.all([
    prisma.article.count({ where: { createdBy: userId } }),
    prisma.video.count({ where: { createdBy: userId } }),
    prisma.leave.count({ where: { userId } }),
    prisma.course.count({ where: { creatorId: userId } }),
  ])

  return { articles, videos, leaves, courses }
}

export default async function ContentCreatorDashboard() {
  await requireRole(["CONTENT_CREATOR", "ADMIN"])
  const session = await getServerSession(authOptions)
  const stats = await getContentStats(session!.user.id)

  return (
    <DashboardLayout title="Content Creator Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Content Creator Dashboard</h1>
          <p className="text-gray-600">Create and manage educational content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.articles}</div>
              <p className="text-xs text-muted-foreground">Created articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.videos}</div>
              <p className="text-xs text-muted-foreground">Uploaded videos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leaves</CardTitle>
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leaves}</div>
              <p className="text-xs text-muted-foreground">Leave requests</p>
            </CardContent>
          </Card>

          
            
            
        </div>

        {/* Content Creation Tools */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Create Content
              </CardTitle>
              <CardDescription>Start creating new educational content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  <Link href="/dashboard/content/article/new">New Article</Link>
                </Button>
                <Button className="w-full justify-start">
                  <Video className="mr-2 h-4 w-4" />
                  <Link href="/dashboard/content/video/new">New Video</Link>
                </Button>
                
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Leave Management
              </CardTitle>
              <CardDescription>Manage leave requests and approvals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  <Link href="/dashboard/leaves/apply">Apply Leave</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/leaves/history">Leave History</Link>
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/holidays">Holiday Calendar</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Review Management
              </CardTitle>
              <CardDescription>Manage reviews and feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/reviews">View Reviews</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
           
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Payroll Management
              </CardTitle>
              <CardDescription>Manage payroll and compensation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Link href="/dashboard/payroll">View Payroll</Link>
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
                            <Plus className="mr-2 h-4 w-4" />
                            <Link href="/dashboard/support-ticket">Create Ticket</Link>
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Link href="/dashboard/support-ticket/view">View All Tickets</Link>
                          </Button>
                          
                        </div>
                      </CardContent>
                    </Card>
          
        </div>
      </div>
    </DashboardLayout>
  )
}
