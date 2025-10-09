import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname.startsWith("/auth/") || pathname === "/" || pathname === "/review" || pathname==="/public" || pathname==="/anonymousfeedback") {
    return NextResponse.next();
  }

  // Redirect unauthenticated users
  if (!token) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // Role-based route protection
  if (pathname.startsWith("/dashboard/") && token?.role) {
    const roleFromPath = pathname.split("/")[2];

    // Pages that all authenticated users can access
    const sharedPages = ["profile", "settings", "leaves", "payroll","support-ticket","reviews"];
    if (sharedPages.includes(roleFromPath)) {
      return NextResponse.next();
    }

    // Role mapping for dashboards
    const roleMapping: Record<string, string> = {
      admin: "ADMIN",
      hr: "HR",
      teacher: "TEACHER",
    
      employee: "EMPLOYEE",
    };

    const requiredRole = roleMapping[roleFromPath as keyof typeof roleMapping];
    if (requiredRole && token.role !== requiredRole && token.role !== "ADMIN") {
      // Redirect to user's own dashboard
      const redirectTo: Record<string, string> = {
        ADMIN: "/dashboard/admin",
        HR: "/dashboard/hr",
        TEACHER: "/dashboard/teacher",
       
        EMPLOYEE: "/dashboard/employee",
      };
      return NextResponse.redirect(new URL(redirectTo[token.role], req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ],
};
