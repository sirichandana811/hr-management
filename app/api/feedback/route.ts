import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { validateCollegeEmail } from "@/lib/email-validation";


export async function POST(req: Request) {
  try {
    

    const body = await req.json();
    const { empName, empId, college, dept, rating, remarks, studentId ,year} = body;

    if (!empName || !empId || !college || !dept || !rating || !remarks || !studentId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if student exists in the database
    const student = await prisma.student.findFirst({
      where: { email: studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found in database. Cannot submit feedback." },
        { status: 404 }
      );
    }
   if(student.email!==studentId){
    return NextResponse.json({ error: "Student email does not match" }, { status: 400 });
   }
    // Find user by empId
    const user = await prisma.user.findFirst({
      where: { employeeId: empId },
    });

    if (!user) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Save feedback
    const feedback = await prisma.feedback.create({
      data: {
        studentId,
        empName,
        empId,
        college,
        dept,
        rating: parseInt(rating),
        remarks,
        year,
        userId: user.id, // Link feedback to user
      },
    });

    return NextResponse.json({ message: "Feedback submitted", feedback });
  } catch (error) {
    console.error("Error saving feedback:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Security: Only admin and HR can view all feedback
    if (session.user.role !== "ADMIN" && session.user.role !== "HR") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const feedbacks = await prisma.feedback.findMany({
      include: { user: true }, // Include user info
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(feedbacks);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return NextResponse.json({ error: "Error fetching feedback" }, { status: 500 });
  }
}
