import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().max(2000).optional().nullable(),
});

// PATCH /api/hr/reviews/[id] — only the HR who created it (or ADMIN) can edit
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = params;

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.format() }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // only owner HR or ADMIN
  if (session.user.role !== "ADMIN" && existing.reviewerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updated = await prisma.review.update({
    where: { id },
    data: {
      rating: parsed.data.rating ?? existing.rating,
      comment: parsed.data.comment ?? existing.comment,
    },
  });

  return NextResponse.json({ message: "Updated", review: updated });
}

// DELETE /api/hr/reviews/[id] — only owner HR or ADMIN
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user.role !== "HR" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = params;

  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role !== "ADMIN" && existing.reviewerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ message: "Deleted" });
}
