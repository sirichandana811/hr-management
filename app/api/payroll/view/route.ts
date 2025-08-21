import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getServerSession } from "next-auth";
import {authOptions} from "../../../../lib/auth";
// GET /api/payroll/view?userId=teacher1
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const payroll = await prisma.payroll.findUnique({
      where: { userId },
    });

    if (!payroll) {
      return NextResponse.json({ error: "Payroll not found" }, { status: 404 });
    }

    return NextResponse.json(payroll);
  } catch (err) {
    console.error("Error fetching payroll:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
