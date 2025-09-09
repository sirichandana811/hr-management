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

  // ✅ Check if reviews are visible to teachers (global toggle by admin)
  const anyReview = await prisma.review.findFirst({
    select: { visibleToTeacher: true },
  });

  if (!anyReview || !anyReview.visibleToTeacher) {
    return NextResponse.json(
      { error: "Reviews are currently hidden by admin" },
      { status: 403 }
    );
  }

  // ✅ Fetch only reviews with `visibleToTeacher: true`
  const reviews = await prisma.review.findMany({
    where: { teacherId, visibleToTeacher: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });

  // ✅ Aggregate stats only from visible reviews
  const agg = await prisma.review.aggregate({
    where: { teacherId, visibleToTeacher: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  return NextResponse.json({
    visible: true,
    reviews,
    stats: { avgRating: agg._avg.rating, count: agg._count.rating },
  });
}
