import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all feedbacks (for Admin)

export async function POST(req: Request) {
  try {
    const {
      studentId,
      year,
      empName,
      empId,
      college,
      dept,
      rating,
      remarks,
    } = await req.json();

    if (!studentId || !year || !empId || !college || !dept || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        studentId: studentId,
        year,
        empName,
        empId,
        college,
        dept,
        rating: Number(rating),
        remarks,
      },
    });

    return NextResponse.json(feedback);
  } catch (error) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  // Security: Verify admin role
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 50; // fixed page size
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.feedback.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }, // optional: newest first
      }),
      prisma.feedback.count(),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// DELETE API for /api/admin/feedback/[id]


// PATCH -> Toggle visibility
export async function PATCH(req: Request) {
  // Security: Verify admin role
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, visible } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Feedback ID required" }, { status: 400 });
    }

    const updated = await prisma.feedback.update({
      where: { id },
      data: { visibleToTeacher: visible },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("❌ Error updating visibility:", error);
    return NextResponse.json(
      { error: "Failed to update feedback visibility" },
      { status: 500 }
    );
  }
}
