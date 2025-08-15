import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        employeeId: true,
        isActive: true,
        salary: true,
        maxCL: true,
        usedCL: true,
        maxSL: true,
        usedSL: true,
        maxPL: true,
        usedPL: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      role,
      department,
      employeeId,
      isActive,
      salary,
      maxCL,
      usedCL,
      maxSL,
      usedSL,
      maxPL,
      usedPL,
    } = body;

    // Basic validation (extend as needed)
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate role is in enum or null
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        name,
        email,
        role: role || null,
        department: department || null,
        employeeId: employeeId || null,
        isActive,
        salary: salary !== undefined ? salary : null,
        maxCL: maxCL !== undefined ? maxCL : 20,
        usedCL: usedCL !== undefined ? usedCL : 0,
        maxSL: maxSL !== undefined ? maxSL : 20,
        usedSL: usedSL !== undefined ? usedSL : 0,
        maxPL: maxPL !== undefined ? maxPL : 20,
        usedPL: usedPL !== undefined ? usedPL : 0,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("PATCH user error:", error);

    // Handle unique constraint errors, e.g. duplicate email or employeeId
    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("email")
    ) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    if (
      error.code === "P2002" &&
      error.meta?.target?.includes("employeeId")
    ) {
      return NextResponse.json(
        { error: "Employee ID already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request, { params }: { params: { userid: string } }) {
  const { userid } = params;

  if (!userid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const updatedUser = await prisma.user.update({
      where: { id: userid },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
