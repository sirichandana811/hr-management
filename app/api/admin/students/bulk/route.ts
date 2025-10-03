// app/api/students/bulk/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { students } = await req.json();

    if (!students || !Array.isArray(students)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Extract emails only
    const emails = students
      .map((s: any) => String(s.email || "").trim().toLowerCase())
      .filter((email: string) => email.includes("@"));

    if (emails.length === 0) {
      return NextResponse.json({ error: "No valid emails found" }, { status: 400 });
    }

    // Use createMany with skipDuplicates
    const result = await prisma.student.createMany({
      data: emails.map((email) => ({ email })),
      skipDuplicates: true,
    });

    return NextResponse.json({ insertedCount: result.count });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
