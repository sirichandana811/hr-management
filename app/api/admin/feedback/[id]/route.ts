import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma"; 
export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.pathname.split("/").pop(); // extract ID

    if (!id) {
      return NextResponse.json({ error: "Missing review id" }, { status: 400 });
    }

    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
