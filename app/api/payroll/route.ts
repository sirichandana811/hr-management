// app/api/payroll/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ✅ GET all users with payroll
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: { notIn: ["ADMIN","HR"] } }, // Exclude admin users
      include: { payroll: true },
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
    const { id, basic, hra, allowances, deductions } = await req.json();

    const grossSalary = basic + hra + allowances;
    const netSalary = grossSalary - deductions;

    // update user payroll (if exists → update, else → create)
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        salary: netSalary, // save final salary on user
        payroll: {
          upsert: {
            create: {
              basic,
              hra,
              allowances,
              deductions,
              grossSalary,
              netSalary,
            },
            update: {
              basic,
              hra,
              allowances,
              deductions,
              grossSalary,
              netSalary,
            },
          },
        },
      },
      include: { payroll: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating salary:", error);
    return NextResponse.json({ error: "Failed to update salary" }, { status: 500 });
  }
}
