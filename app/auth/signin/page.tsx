"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("") // ✅ Role state
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email,
        password,
        role, // ✅ send role
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid credentials or role")
        return
      }

      const session = await getSession()

      if (session?.user?.role) {
        const roleRoutes: Record<string, string> = {
          ADMIN: "/dashboard/admin",
          HR: "/dashboard/hr",
          TEACHER: "/dashboard/teacher",
          CONTENT_CREATOR: "/dashboard/content",
         
        }

        router.push(roleRoutes[session.user.role] || "/select-role")
      } else {
        router.push("/select-role")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/select-role" })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">Enter your credentials and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            {/* ✅ Role Selection */}
            <div>
              <Label>Role</Label>
              <select
                className="w-full border rounded px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select role</option>
                <option value="ADMIN">Admin</option>
                <option value="HR">HR</option>
                <option value="TEACHER">Teacher</option>
                <option value="CONTENT_CREATOR">Content Creator</option>
               
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/auth/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
