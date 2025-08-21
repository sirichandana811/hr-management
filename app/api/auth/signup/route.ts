import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name,
      email,
      password,
      role,
      department,
      employeeId,
      phoneNumber,
      address,
      dateOfJoining,
      salary,
      image,} = body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return new Response(JSON.stringify({ error: "Email already registered" }), { status: 400 });
    }

    // Check if employeeId already exists (if provided)
    if (employeeId) {
      const existingEmployeeId = await prisma.user.findUnique({
        where: { employeeId },
      });

      if (existingEmployeeId) {
        return new Response(JSON.stringify({ error: "Employee ID already exists" }), { status: 400 });
      }
    }

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
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
        salary,
        image,
        isActive: true,
        // or default true/false as you prefer
      },
    });
     let payrollData = {
      basic: 0,
      hra: 0,
      allowances: 0,
      deductions: 0,
      grossSalary: 0,
      netSalary: 0,
    };

    if (role === "TEACHER") {
      payrollData = {
        basic: 20000,
        hra: 8000,
        allowances: 5000,
        deductions: 2000,
        grossSalary: 20000 + 8000 + 5000,
        netSalary: 20000 + 8000 + 5000 - 2000,
      };
    } else if (role === "CONTENT_CREATOR") {
      payrollData = {
        basic: 15000,
        hra: 6000,
        allowances: 4000,
        deductions: 1500,
        grossSalary: 15000 + 6000 + 4000,
        netSalary: 15000 + 6000 + 4000 - 1500,
      };
    }

    // ✅ create payroll with userId
    await prisma.payroll.create({
      data: {
        userId: newUser.id, // <- now correctly passed
        ...payrollData,
      },
    });

    return new Response(JSON.stringify({ message: "User created successfully", userId: newUser.id }), {
      status: 201,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ error: "Signup failed due to server error" }), { status: 500 });
  }
}
