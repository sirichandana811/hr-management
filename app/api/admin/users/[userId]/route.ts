import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"
import { UserRole } from "@prisma/client"

const updateUserSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().email(),
  role: z.enum([
    "ADMIN",
    "HR",
    "TEACHER",
    "CONTENT_CREATOR",
    "SUPPORT_STAFF",
    "EMPLOYEE",
  ]).nullable().optional(),
  department: z.string().nullable().optional(),
  employeeId: z.string().nullable().optional(),
  phoneNumber: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  dateOfJoining: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? new Date(val) : null)),
  salary: z
    .number()
    .nullable()
    .optional(),
  isActive: z.boolean(),
  maxCL: z.number().int().nonnegative(),
  usedCL: z.number().int().nonnegative(),
  maxSL: z.number().int().nonnegative(),
  usedSL: z.number().int().nonnegative(),
  maxPL: z.number().int().nonnegative(),
  usedPL: z.number().int().nonnegative(),
});


export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = await params;  // await here to get actual params object
  const { userId } = resolvedParams;


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
        salary: true,
        isActive: true,
        maxCL: true,
        usedCL: true,
        maxSL: true,
        usedSL: true,
        maxPL: true,
        usedPL: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
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

    // Validate request body
    const updateData = updateUserSchema.parse(body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check email uniqueness if changed
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

    // Check employeeId uniqueness if changed (nullable)
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

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        // Make sure if dateOfJoining is null, Prisma handles it correctly
        dateOfJoining: updateData.dateOfJoining ?? null,
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
}export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId } = params

    // Prevent admin from deleting themselves
    if (userId === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user and related data
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
