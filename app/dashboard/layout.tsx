import type React from "react"

import { getRequiredSession } from "@/lib/auth-utils"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated
  await getRequiredSession()

  return <>{children}</>
}
