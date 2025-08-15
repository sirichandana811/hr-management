"use client"

import type React from "react"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
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

  // --- ADDED: sign out HR user on Back navigation ---
useEffect(() => {
    const handleBeforeUnload = () => {
      signOut({ redirect: false }) // Sign out silently on page unload
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])
  // ---------------------------------------------------

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/signin" })
  }

  const getNavigationItems = () => {
    const role = session?.user?.role
    const baseItems = [{ icon: Home, label: "Dashboard", href: getDashboardPath(role) }]

    switch (role) {
      case "ADMIN":
        return [
          ...baseItems,
          { icon: Users, label: "User Management", href: "/dashboard/admin/users" },
          { icon: Settings, label: "System Settings", href: "/dashboard/admin/settings" },
          { icon: FileText, label: "Reports", href: "/dashboard/admin/reports" },
        ]
      case "HR":
        return [
          ...baseItems,
          { icon: Users, label: "Employees", href: "/dashboard/hr/employees/users" },
          { icon: UserCheck, label: "Attendance", href: "/dashboard/hr/attendance" },
          { icon: FileText, label: "Payroll", href: "/dashboard/hr/payroll" },
          { icon: FileText, label: "Reviews", href: "/dashboard/hr/reviews" }
        ]
      case "TEACHER":
        return [
          ...baseItems,
          { icon: BookOpen, label: "My Courses", href: "/dashboard/teacher/courses" },
          { icon: Users, label: "Students", href: "/dashboard/teacher/students" },
          { icon: FileText, label: "Assignments", href: "/dashboard/teacher/assignments" },
          { icon: FileText, label: "Review", href: "/dashboard/teacher/reviews" }
        ]
      case "CONTENT_CREATOR":
        return [
          ...baseItems,
          { icon: BookOpen, label: "Content Library", href: "/dashboard/content/library" },
          { icon: FileText, label: "Create Content", href: "/dashboard/content/create" },
          { icon: Settings, label: "Publishing", href: "/dashboard/content/publish" },
        ]
      case "SUPPORT_STAFF":
        return [
          ...baseItems,
          { icon: HelpCircle, label: "Support Tickets", href: "/dashboard/support/tickets" },
          { icon: Users, label: "User Issues", href: "/dashboard/support/users" },
          { icon: FileText, label: "Knowledge Base", href: "/dashboard/support/kb" },
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
                  <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
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
