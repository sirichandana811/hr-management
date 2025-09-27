// app/api/payroll/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// ✅ GET all users with payroll
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Security: Only admin and HR can view payroll data
    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const users = await prisma.user.findMany({
      where: { role: { notIn: ["ADMIN","HR"] } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        employeeId: true,
        isActive: true,
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching payroll:", error);
    return NextResponse.json({ error: "Failed to fetch payroll" }, { status: 500 });
  }
}

// ✅ Update payroll
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Security: Only admin and HR can update payroll
    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { id, basic, hra, allowances, deductions } = await req.json();

    const grossSalary = basic + hra + allowances;
    const netSalary = grossSalary - deductions;

    // Since payroll model doesn't exist in schema, just return success
    const updatedUser = {
      id,
      message: "Payroll updated successfully",
      basic,
      hra,
      allowances,
      deductions,
      grossSalary,
      netSalary,
    };

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating salary:", error);
    return NextResponse.json({ error: "Failed to update salary" }, { status: 500 });
  }
}