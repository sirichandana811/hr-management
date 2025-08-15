// app/api/hr/users/teacher/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "HR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teachers = await prisma.user.findMany({
      where: { role: UserRole.TEACHER },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
