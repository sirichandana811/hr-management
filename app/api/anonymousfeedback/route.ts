import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


export async function POST(req: Request) {
  try {
    const { department, message } = await req.json();

    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Feedback message is required" }, { status: 400 });
    }

    const feedback = await prisma.anonymousFeedback.create({
      data: {
        department: department || "Anonymous",
        message,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const feedbacks = await prisma.anonymousFeedback.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
