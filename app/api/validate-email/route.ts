import { NextResponse } from "next/server";
import { validateCollegeEmail, getCollegeEmailDomains } from "@/lib/email-validation";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const validation = validateCollegeEmail(email);
    
    return NextResponse.json({
      ...validation,
      validDomains: getCollegeEmailDomains()
    });
  } catch (error) {
    console.error("Email validation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      validDomains: getCollegeEmailDomains(),
      message: "Valid college email domains"
    });
  } catch (error) {
    console.error("Get domains error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
