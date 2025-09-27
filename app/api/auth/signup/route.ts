import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { validateCollegeEmail } from "@/lib/email-validation";

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
      skills = [],
      image,} = body;

    // Basic validation
    if (!name || !email || !password || !role || !employeeId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Validate college email
    const emailValidation = validateCollegeEmail(email);
    if (!emailValidation.isValid) {
      return new Response(JSON.stringify({ error: emailValidation.message }), { status: 400 });
    }

    // For students, require college email
    if (role === "STUDENT" && !emailValidation.isCollegeEmail) {
      return new Response(JSON.stringify({ 
        error: "Students must use a valid college email address",
        validDomains: emailValidation.domain ? [emailValidation.domain] : []
      }), { status: 400 });
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
        skills,
        phoneNumber,
        address,
        dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : undefined,
       
        
        isActive: true,
        // or default true/false as you prefer
      },
    });
    

   

    // ✅ create payroll with userId
    
    return new Response(JSON.stringify({ message: "User created successfully", userId: newUser.id }), {
      status: 201,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return new Response(JSON.stringify({ error: "Signup failed due to server error" }), { status: 500 });
  }
}
