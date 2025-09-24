// app/api/leaves/types/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// app/api/leaves/types/route.ts


export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { name, limit, description } = await req.json();

    if (!name || !limit) {
      return NextResponse.json({ error: "Name and limit are required" }, { status: 400 });
    }

    const leaveType = await prisma.leaveType.create({
      data: { name, limit, description },
    });

    // Assign initial leave balances to all users
    const users = await prisma.user.findMany();
    for (const user of users) {
      await prisma.leaveBalance.create({
        data: {
          userId: user.id,
          leaveTypeId: leaveType.id,
          leaveTypeName: leaveType.name,
          used: 0,
          remaining: limit,
        },
      });
    }

    return NextResponse.json(leaveType);
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "Leave type already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ Get all leave types
// app/api/leaves/types/route.ts


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const types = await prisma.leaveType.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(types);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

