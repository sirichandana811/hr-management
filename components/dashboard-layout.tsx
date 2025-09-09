"use client"

import type React from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, BookOpen, FileText, HelpCircle, Settings, LogOut, Home, UserCheck } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()

  // ✅ Cleaned-up SignOut
  const handleSignOut = async () => {
    localStorage.clear()
    sessionStorage.clear()
    await signOut({ callbackUrl: "/auth/signin" }) // redirect handled by NextAuth
  }

  const getNavigationItems = () => {
    const role = session?.user?.role
    const baseItems = [{ icon: Home, label: "Dashboard", href: getDashboardPath(role) }]

    switch (role) {
      case "ADMIN":
        return [
          ...baseItems,
          { icon: Users, label: "User Management", href: "/dashboard/admin/users" },
          { icon: UserCheck, label: "Attendance", href: "/dashboard/admin/attendance" },
          { icon: HelpCircle, label: "Support Tickets", href: "/dashboard/admin/ticket" },
          { icon: FileText, label: "Leave Management", href: "/dashboard/admin/leave-management" },
          { icon: BookOpen, label: "Teacher Log", href: "/dashboard/teacher-log-view" },
          { icon: FileText, label: "Reviews", href: "/dashboard/admin/reviews" },
        ]
      case "HR":
        return [
          ...baseItems,
          { icon: Users, label: "Employees", href: "/dashboard/hr/employees/users" },
          { icon: FileText, label: "Reviews", href: "/dashboard/hr/reviews" },
          { icon: FileText, label: "Leave Requests", href: "/dashboard/hr/leaves" },
        ]
      case "TEACHER":
        return [
          ...baseItems,
          { icon: BookOpen, label: "My Topics", href: "/dashboard/teacher/teacher-log/view" },
          { icon: FileText, label: "Reviews", href: "/dashboard/reviews" },
          { icon: FileText, label: "Leave Requests", href: "/dashboard/teacher/leaves/history" },
          { icon: UserCheck, label: "Attendance", href: "/dashboard/teacher/attendance" },
        ]
      default:
        return [
          ...baseItems,
          { icon: FileText, label: "My Profile", href: "/dashboard/employee/profile" },
          { icon: HelpCircle, label: "Support", href: "/dashboard/employee/support" },
        ]
    }
  }

  const getDashboardPath = (role: string | null | undefined) => {
    const roleRoutes = {
      ADMIN: "/dashboard/admin",
      HR: "/dashboard/hr",
      TEACHER: "/dashboard/teacher",
      CONTENT_CREATOR: "/dashboard/content",
      SUPPORT_STAFF: "/dashboard/support",
      EMPLOYEE: "/dashboard/employee",
    }
    return role ? roleRoutes[role as keyof typeof roleRoutes] : "/dashboard/employee"
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">EdTech HRMS</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {session?.user?.role
                  ?.replace("_", " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
                      <AvatarFallback>{session?.user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {session?.user?.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => router.push("/dashboard/admin/profile")}>
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                  )}
                  {session?.user?.role !== "ADMIN" && (
                    <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                      <span>Profile Settings</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{title}</h2>
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Button variant="ghost" className="w-full justify-start" onClick={() => router.push(item.href)}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
