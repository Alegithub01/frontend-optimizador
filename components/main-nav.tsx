"use client"

import { useAuthContext } from "@/context/AuthContext"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import UserDropdown from "./user-dropdown"
import { usePathname } from "next/navigation"

export default function MainNav() {
  const { user, isAuthenticated, logout } = useAuthContext()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const pathname = usePathname()
  const isHomePage = pathname === "/" || pathname === "/sobre-nosotros"

  const rawLinks = [
    { slug: "cursos", label: "Cursos" },
    { slug: "eventos", label: "Eventos" },
    { slug: "productos", label: "Productos" },
    { slug: "testimonios", label: "Testimonios" },
    { slug: "blogs", label: "Blogs", isBlog: true, isActive: false },
  ]

  const navLinks = rawLinks.map((link) => ({
    ...link,
    href: link.isBlog ? "/blogs" : isHomePage ? `#${link.slug}` : `/${link.slug}`,
  }))

  return (
    <header className={`py-3 md:py-4 px-4 sticky top-0 z-50 ${isHomePage ? "bg-black" : "bg-white"}`}>
      <div className="container mx-auto">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative w-6 h-6 md:w-8 md:h-8">
                <Image src="/logo.svg" alt="Optimizador" fill className="object-contain" />
              </div>
              <span className={`text-lg md:text-xl font-bold ${isHomePage ? "text-white" : "text-black"}`}>
                Optimizador
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 lg:space-x-12">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm lg:text-base ${
                  link.isActive ? "text-orange-700" : isHomePage ? "text-white" : "text-black"
                } hover:text-orange-400 transition-colors`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex gap-3 lg:gap-5">
            {isAuthenticated ? (
              <UserDropdown user={user!} onLogout={logout} />
            ) : (
              <>
                <Link href="/login">
                  <button
                    className={`px-3 lg:px-4 py-1 text-sm lg:text-base rounded-md transition border ${
                      isHomePage
                        ? "border-white text-white hover:bg-white hover:text-black"
                        : "border-black text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    Iniciar sesión
                  </button>
                </Link>
                <Link href="/registro">
                  <button className="bg-orange-700 text-white px-3 lg:px-4 py-1 text-sm lg:text-base rounded-md hover:bg-orange-600 transition">
                    Registrarse
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu - Versión modificada */}
          <div className="flex items-center gap-3 md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`${isHomePage ? "text-white hover:text-orange-700" : "text-black hover:text-orange-700"}`}
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs bg-white text-black border-gray-200">
                <div className="h-full flex flex-col">
                  {/* Sección de usuario ARRIBA */}
                  <div className="w-full border-b border-gray-200 pb-6 mb-6">
                    {isAuthenticated ? (
                      <div className="flex flex-col items-center">
                        <UserDropdown user={user!} onLogout={logout} customIcon="/logo-plomo.svg" isMobile={true} />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4 w-full">
                        <Link
                          href="/login"
                          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
                          className="w-full"
                        >
                          <button className="w-full border-2 border-black text-black hover:bg-black hover:text-white px-4 py-3 rounded-md transition text-xl font-bold">
                            Iniciar sesión
                          </button>
                        </Link>
                        <Link
                          href="/registro"
                          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
                          className="w-full"
                        >
                          <button className="w-full bg-orange-700 text-white px-4 py-3 rounded-md hover:bg-orange-600 transition text-xl font-bold">
                            Registrarse
                          </button>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Enlaces de navegación en el centro */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
                        className="w-full text-center"
                      >
                        <span className="text-2xl font-bold text-black hover:text-orange-500 transition-colors block py-3">
                          {link.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>

        {isSearchOpen && (
          <div className="mt-3 md:mt-4 relative md:hidden">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar"
              className="pl-10 pr-10 py-2 bg-gray-100 text-black rounded-md w-full"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(false)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
