import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tickets = await prisma.SupportTicket.findMany({
      where: {
        user: {
          role: { in: ["HR", "ADMIN"] },
        },
      },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}
