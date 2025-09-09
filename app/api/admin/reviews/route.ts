import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reviews = await prisma.review.findMany({
    include: {
      reviewer: true,
      teacher: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const visible = reviews[0]?.visibleToTeacher ?? false;

  return NextResponse.json({ reviews, visible });
}
