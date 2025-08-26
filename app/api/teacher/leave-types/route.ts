// app/api/leaves/types/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const leaveTypes = await prisma.leaveType.findMany();

    const balances = await prisma.leaveBalance.findMany({
      where: { userId: session.user.id },
    });

    // Merge balances with leave types
    const result = leaveTypes.map((type) => {
      const balance = balances.find((b) => b.leaveTypeId === type.id);
      return {
        id: type.id,
        name: type.name,
        limit: type.limit,
        description: type.description || "",
        used: balance ? balance.used : 0,
        remaining: balance ? balance.remaining : type.limit,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch leave types" }, { status: 500 });
  }
}
