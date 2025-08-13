"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function HomePage() {
 
  const router = useRouter()
  

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">EdTech HRMS</h1>
          <p className="text-xl text-gray-600 mb-8">
            Comprehensive Human Resource Management System for Educational Technology Companies
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 mb-12">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access</CardTitle>
              <CardDescription>
                Secure dashboards tailored for different roles including Admin, HR, Teachers, Content Creators, and
                Support Staff
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Administrator Dashboard</li>
                <li>• HR Management Portal</li>
                <li>• Teacher Resources</li>
                <li>• Content Creation Tools</li>
                <li>• Support Ticket System</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Features</CardTitle>
              <CardDescription>All-in-one solution for managing your educational technology workforce</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• User Management</li>
                <li>• Course Administration</li>
                <li>• Support Ticketing</li>
                <li>• Reporting & Analytics</li>
                <li>• Secure Authentication</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <div className="space-x-4">
            <Button asChild size="lg">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
