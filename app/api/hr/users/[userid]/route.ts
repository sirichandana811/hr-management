import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/hr/users/[userid]
export async function GET(
  req: Request,
  { params }: { params: { userid: string } }
) {
  const { userid } = params;

  if (!userid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userid },
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
        isActive: true,
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

// PATCH /api/hr/users/[userid]
export async function PATCH(
  req: Request,
  { params }: { params: { userid: string } }
) {
  const { userid } = params;

  if (!userid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const body = await req.json();

  // Only allow fields HR can update (salary and leave fields removed)
  const allowedFields = [
    "name",
    "email",
    "department",
    "phoneNumber",
    "address",
    "dateOfJoining",
    "isActive",
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

// DELETE /api/hr/users/[userid]
export async function DELETE(
  req: Request,
  { params }: { params: { userid: string } }
) {
  const { userid } = await params;

  if (!userid) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userid },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete related records if any (leave and payroll are optional, remove if not used)
   

    // Delete the user
    await prisma.user.delete({
      where: { id: userid },
    });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
