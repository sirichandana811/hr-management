import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { SessionProvider } from "@/components/session-provider"

export const metadata: Metadata = {
  title: "TrailblizOne - Empowering Careers, Fostering Growth",
  description: "Where unemployed meets unstoppable — empowering careers, fostering growth, and crafting professionals with world-class training, mentorship, and placement support.",
  generator: "v0.dev",
  icons: {
    icon: "/logo.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}
