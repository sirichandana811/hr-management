// app/api/leaves/update/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { requestId, status } = await req.json();

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
    });

    if (!leaveRequest) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    if (status === "REJECTED" || status === "CANCELLED") {
      const balance = await prisma.leaveBalance.findFirst({
        where: {
          userId: leaveRequest.userId,
          leaveTypeId: leaveRequest.leaveTypeId,
        },
      });

      if (balance) {
        await prisma.leaveBalance.update({
          where: { id: balance.id },
          data: {
            used: balance.used - leaveRequest.days,
            remaining: balance.remaining + leaveRequest.days,
          },
        });
      }
    }

    const updated = await prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
