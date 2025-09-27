import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Security: Only admin and HR can view all users
    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const users = await prisma.user.findMany();
    return NextResponse.json({ users });
  } catch (err) {
    console.error("Fetch users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
