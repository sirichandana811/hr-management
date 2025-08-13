import type { UserRole } from "@prisma/client"
import "next-auth"
import "next-auth/jwt"
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role?: UserRole | null
    }
  }

  interface User {
    role?: UserRole | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole | null
  }
}
