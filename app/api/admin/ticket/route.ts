import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  // Security: Verify admin role
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tickets = await prisma.supportTicket.findMany({
      where: {
        OR: [
          { user: { role: { in: ["HR", "ADMIN"] } } },
          { sharedToAdmin: true }, // ✅ include tickets explicitly shared to admin
        ],
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tickets, { status: 200 });
  } catch (err) {
    console.error("GET Tickets Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
      { status: 500 }
    );
  }
}
