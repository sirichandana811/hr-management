import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// Updated schema with skills
const updateUserSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email(),
  role: z
    .enum([
      "ADMIN",
      "HR",
      "TEACHER",
    ])
    .nullable()
    .optional(),
  department: z.string().nullable().optional(),
  employeeId: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  dateOfJoining: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  isActive: z.boolean(),
  skills: z.array(z.string()).optional(), // ✅ Added skills
});

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        skills: true, // ✅ return skills
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;
    const body = await request.json();

    const updateData = updateUserSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });
      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 }
        );
      }
    }

    if (
      updateData.employeeId !== undefined &&
      updateData.employeeId !== existingUser.employeeId
    ) {
      if (updateData.employeeId !== null) {
        const employeeIdExists = await prisma.user.findUnique({
          where: { employeeId: updateData.employeeId },
        });
        if (employeeIdExists) {
          return NextResponse.json(
            { error: "Employee ID already exists" },
            { status: 400 }
          );
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        dateOfJoining: updateData.dateOfJoining ?? null,
        skills: updateData.skills ?? existingUser.skills, // ✅ update skills
      },
    });

    return NextResponse.json(
      { message: "User updated successfully", user },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId } = params;

    if (userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await prisma.leaveBalance.deleteMany({ where: { userId } });

    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
