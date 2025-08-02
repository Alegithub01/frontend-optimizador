"use client"

import React from "react"

export default function OptikidsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {/* Aquí no pones MainNav ni Footer */}
      {children}
    </div>
  )
}
