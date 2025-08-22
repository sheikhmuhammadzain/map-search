import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Maps Search - Professional Heatmap Visualization",
  description: "Professional maps search application with heatmap visualization",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col">
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur border-b border-border">
              <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src="/placeholder-logo.svg" alt="Maps Search" className="h-6 w-6" />
                  <span className="font-semibold text-foreground">Maps Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                </div>
              </div>
            </header>
            <main className="flex-1">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
