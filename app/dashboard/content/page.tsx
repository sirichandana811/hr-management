import { requireRole } from "@/lib/auth-utils"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { FileText, Video, ImageIcon, BookOpen, Plus, Upload, Eye } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

async function getContentStats(userId: string) {
  const [createdCourses, totalContent] = await Promise.all([
    prisma.course.count({
      where: { creatorId: userId },
    }),
    prisma.course.count({
      where: { creatorId: userId },
    }),
  ])

  return {
    createdCourses,
    totalContent: totalContent * 15, // Simulated content count
    publishedContent: totalContent * 12,
    draftContent: totalContent * 3,
  }
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
              <CardTitle className="text-sm font-medium">Total Content</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalContent}</div>
              <p className="text-xs text-muted-foreground">All content items</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.publishedContent}</div>
              <p className="text-xs text-muted-foreground">Live content</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drafts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.draftContent}</div>
              <p className="text-xs text-muted-foreground">Work in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.createdCourses}</div>
              <p className="text-xs text-muted-foreground">Created courses</p>
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
                  New Article
                </Button>
                <Button className="w-full justify-start">
                  <Video className="mr-2 h-4 w-4" />
                  New Video
                </Button>
                <Button className="w-full justify-start">
                  <BookOpen className="mr-2 h-4 w-4" />
                  New Course
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Content Library
              </CardTitle>
              <CardDescription>Manage your existing content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View All Content
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Draft Content
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Content Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Media & Assets
              </CardTitle>
              <CardDescription>Manage images, videos, and files</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Media
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Media Library
                </Button>
                <Button className="w-full justify-start bg-transparent" variant="outline">
                  Asset Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Content Activity</CardTitle>
            <CardDescription>Your latest content creation activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Published new course</p>
                  <p className="text-xs text-gray-500">"Advanced React Concepts" - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Updated video content</p>
                  <p className="text-xs text-gray-500">"JavaScript Fundamentals" - 4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Created new article draft</p>
                  <p className="text-xs text-gray-500">"Best Practices in Web Development" - 1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
