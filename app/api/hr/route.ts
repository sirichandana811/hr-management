import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // Security: Verify HR role
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== "HR") {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    const [
      totalEmployees,
      activeEmployees,
      pendingRequests,
      recentHires,
      pendingLeaves,
      approvedLeaves,
    ] = await Promise.all([
      prisma.user.count({
        where: { role: { not: "ADMIN" } },
      }),
      prisma.user.count({
        where: {
          role: { not: "ADMIN" },
          isActive: true,
        },
      }),
      prisma.supportTicket.count({
        where: { status: "OPEN" },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
          },
        },
      }),
      prisma.leaveRequest.count({
        where: { status: "PENDING" },
      }),
      prisma.leaveRequest.count({
        where: { status: "APPROVED" },
      }),
    ])

    return res.status(200).json({
      totalEmployees,
      activeEmployees,
      pendingRequests,
      recentHires,
      pendingLeaves,
      approvedLeaves,
    })
  } catch (error) {
    console.error("Error fetching HR stats:", error)
    return res.status(500).json({ error: "Failed to fetch HR stats" })
  }
}
