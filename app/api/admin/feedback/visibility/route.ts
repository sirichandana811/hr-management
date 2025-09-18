import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; // adjust if your prisma client path differs

// PATCH -> Update visibility for ALL feedbacks at once
export async function PATCH(req: Request) {
  try {
    const { visible } = await req.json();

    if (typeof visible !== "boolean") {
      return NextResponse.json({ error: "Visible must be boolean" }, { status: 400 });
    }

    // Update all feedbacks
    await prisma.feedback.updateMany({
      data: { visibleToTeacher: visible },
    });

    return NextResponse.json({ success: true, visible });
  } catch (error) {
    console.error("❌ Error updating all feedback visibility:", error);
    return NextResponse.json(
      { error: "Failed to update all feedbacks visibility" },
      { status: 500 }
    );
  }
}
