import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // your NextAuth options
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, department, phoneNumber, address } = body;

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name,
        email,
        department,
        phoneNumber,
        address,
      },
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
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
