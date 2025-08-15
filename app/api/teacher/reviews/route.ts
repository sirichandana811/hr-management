import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = session.user.id;

  const reviews = await prisma.review.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });

  const agg = await prisma.review.aggregate({
    where: { teacherId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return NextResponse.json({
    reviews,
    stats: { avgRating: agg._avg.rating, count: agg._count.rating },
  });
}
