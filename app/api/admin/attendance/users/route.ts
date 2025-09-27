import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ Enum for allowed roles (uppercase)
enum UserRole {
  TEACHER = "TEACHER",
  HR = "HR",
}

export async function GET(req: Request) {
  // Security: Verify admin role
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role");

    if (!roleParam) {
      return NextResponse.json({ error: "Missing role parameter" }, { status: 400 });
    }

    const role = roleParam.toUpperCase() as UserRole;

    // ✅ Validate role against enum
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Allowed: TEACHER, HR" },
        { status: 400 }
      );
    }

    // ✅ Fetch users by role (stored as uppercase in DB)
    const users = await prisma.user.findMany({
      where: { role },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        role: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
