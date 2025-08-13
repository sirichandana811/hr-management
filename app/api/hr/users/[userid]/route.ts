
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { userid: string } } // must match folder name
) {
  const { userid } = params;

  if (!userid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userid }, // Prisma needs a valid string ID
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        employeeId: true,
        phoneNumber: true,
        address: true,
        dateOfJoining: true,
        salary: true,
        isActive: true,
        maxCL: true,
        usedCL: true,
        maxSL: true,
        usedSL: true,
        maxPL: true,
        usedPL: true,
      },
    });

    if (!user || user.role === "ADMIN" || user.role === "HR") {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/hr/users/[userId]
// app/api/hr/users/[userid]/route.ts

export async function PATCH(
  req: Request,
  { params }: { params: { userid: string } }
) {
  const { userid } = params;

  if (!userid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const body = await req.json();

  // Only allow fields HR can update
  const allowedFields = [
    "name",
    "email",
    "department",
    "phoneNumber",
    "address",
    "dateOfJoining",
    "salary",
    "isActive",
    "maxCL",
    "usedCL",
    "maxSL",
    "usedSL",
    "maxPL",
    "usedPL",
  ];

  const data: any = {};
  allowedFields.forEach((field) => {
    if (body[field] !== undefined) data[field] = body[field];
  });

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userid },
      data,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
// app/api/hr/users/[userid]/route.ts

// app/api/hr/users/[userid]/route.ts


export async function DELETE(
  req: Request,
  { params }: { params: { userid: string } }
) {
  const { userid } = params;

  if (!userid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userid },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete all leave records related to this user
    await prisma.leave.deleteMany({
      where: { userId: userid },
    });

    // Now delete the user
    await prisma.user.delete({
      where: { id: userid },
    });

    return NextResponse.json({ message: "User and related leaves deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
