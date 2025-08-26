import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: { name: "asc" },
      include: {
        balances: {
          where: { userId },
        },
      },
    });

    const typesWithRemaining = leaveTypes.map((lt) => {
      const balance = lt.balances[0];
      return {
        id: lt.id,
        name: lt.name,
        description: lt.description || "",
        limit: lt.limit,
        usedLeaves: balance ? balance.used : 0,
        remaining: balance ? balance.remaining : lt.limit,
      };
    });

    return NextResponse.json(typesWithRemaining);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
