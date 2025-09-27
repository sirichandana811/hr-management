// app/api/holidays/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
// app/api/holidays/route.ts

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const holidays = await prisma.holiday.findMany({
      orderBy: { date: "asc" }
    });
    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, date } = await req.json();
  if (!name || !date) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const holiday = await prisma.holiday.create({
    data: {
      name,
      date: new Date(date),
      createdById: session.user.id
    }
  });

  return NextResponse.json(holiday, { status: 201 });
}
