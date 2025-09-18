import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
