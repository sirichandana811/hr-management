import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // adjust path if needed
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust if your auth config is elsewhere

// GET -> Teacher's feedback (only visible ones)
export async function GET(req: Request) {
  try {
    // ✅ Get logged-in user session
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // 👈 use userId from session

    if (!userId) {
      return NextResponse.json({ error: "User ID missing" }, { status: 400 });
    }

    // ✅ Find the teacher record by userId
    const teacher = await prisma.user.findUnique({
      where: { id: userId },
      select: { employeeId: true },
    });

    if (!teacher?.employeeId) {
      return NextResponse.json(
        { error: "Teacher not found or missing employeeId" },
        { status: 404 }
      );
    }

    // ✅ Fetch only reviews for this teacher and only visible ones
    const feedbacks = await prisma.feedback.findMany({
      where: {
        empId: teacher.employeeId,
        visibleToTeacher: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("❌ Error fetching teacher feedback:", error);
    return NextResponse.json(
      { error: "Failed to fetch teacher feedback" },
      { status: 500 }
    );
  }
}
