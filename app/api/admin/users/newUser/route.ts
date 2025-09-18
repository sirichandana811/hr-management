import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role,
      department,
      employeeId,
      phoneNumber,
      address,
      dateOfJoining,
      skills = [],
    } = body;

    if (!name || !email || !password || !role || !employeeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // check duplicate
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        department,
        employeeId,
        phoneNumber,
        address,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
        skills,
      },
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
