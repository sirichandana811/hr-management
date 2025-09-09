import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { visible } = await req.json();

  await prisma.review.updateMany({
    data: { visibleToTeacher: visible },
  });

  return NextResponse.json({ success: true, visible });
}
