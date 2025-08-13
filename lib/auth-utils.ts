import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { redirect } from "next/navigation"
import type { UserRole } from "@prisma/client"

export async function getRequiredSession() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  return session
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getRequiredSession()

  if (!session.user?.role) {
    redirect("/select-role")
  }

  if (!allowedRoles.includes(session.user.role)) {
    // Redirect to user's appropriate dashboard
    const roleRoutes = {
      ADMIN: "/dashboard/admin",
      HR: "/dashboard/hr",
      TEACHER: "/dashboard/teacher",
      CONTENT_CREATOR: "/dashboard/content",
      SUPPORT_STAFF: "/dashboard/support",
      EMPLOYEE: "/dashboard/employee",
    }
    redirect(roleRoutes[session.user.role])
  }

  return session
}

export function hasRole(userRole: UserRole | null | undefined, allowedRoles: UserRole[]): boolean {
  if (!userRole) return false
  return allowedRoles.includes(userRole)
}

export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === "ADMIN"
}

export function canAccessAdminFeatures(userRole: UserRole | null | undefined): boolean {
  return userRole === "ADMIN" || userRole === "HR"
}
