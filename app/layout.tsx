import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import MainNav from "@/components/main-nav"
import Footer from "@/components/footer"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Optimizador - Cursos y Productos para tu Bienestar",
  description: "Descubre cursos, eventos y productos diseñados para potenciar tu bienestar y felicidad.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
      <html lang="es">
        <body className={inter.className}>
          <AuthProvider>
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
              <MainNav />
              <main className="flex-grow">{children}</main>
              <Footer />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </body>
      </html>
    </GoogleOAuthProvider>
  )
}
