import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  teacherId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
});

// POST /api/hr/reviews  (HR creates a review for a teacher)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }
  const { teacherId, rating, comment } = parsed.data;

  // ensure teacher exists and is a TEACHER
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { id: true, role: true, isActive: true },
  });
  if (!teacher || (teacher.role !== "TEACHER" && teacher.role !== "CONTENT_CREATOR")) {
    return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: {
      reviewerId: session.user.id,
      teacherId,
      rating,
      comment: comment ?? null,
    },
  });

  return NextResponse.json({ message: "Review created", review }, { status: 201 });
}

// GET /api/hr/reviews?teacherId=...  (HR lists reviews, optionally filter by teacher)
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "HR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const teacherId = searchParams.get("teacherId") || undefined;

  const where: any = {};
  if (teacherId) where.teacherId = teacherId;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      teacher: { select: { id: true, name: true, email: true, role: true } },
      reviewer: { select: { id: true, name: true, email: true } },
    },
  });

  // also include an average rating if filtered by teacher
  if (teacherId) {
    const agg = await prisma.review.aggregate({
      where: { teacherId },
      _avg: { rating: true },
      _count: { rating: true },
    });
    return NextResponse.json({ reviews, stats: { avgRating: agg._avg.rating, count: agg._count.rating } });
  }

  return NextResponse.json(reviews);
}
