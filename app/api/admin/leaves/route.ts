import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  try {
    // Fetch all leave requests with user info
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") || "HR"; 
    const leaves = await prisma.leaveRequest.findMany({
      where: { role },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, employeeId: true } },
        leaveType: { select: { id: true, name: true } },
      },
    });

    // Map to send necessary info to frontend
    const formatted = leaves.map((l) => ({
      id: l.id,
      userId: l.userId,
      userName: l.user?.name || "-",
      userEmail: l.user?.email || "-",
      employeeId: l.user?.employeeId || "-",
      leaveTypeId: l.leaveTypeId,
      leaveTypeName: l.leaveTypeName || l.leaveType?.name || "-",
      startDate: l.startDate.toISOString(),
      endDate: l.endDate.toISOString(),
      days: l.days,
      status: l.status,
      reason: l.reason || "-",
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
