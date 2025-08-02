"use client"

import { usePathname } from "next/navigation"
import MainNav from "@/components/main-nav"
import Footer from "@/components/footer"
import type React from "react"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const hideNavAndFooter = pathname.startsWith("/optikids/")

  return (
    <>
      {!hideNavAndFooter && <MainNav />}
      <main className="flex-grow">{children}</main>
      {!hideNavAndFooter && <Footer />}
    </>
  )
}
