import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ChevronUp, ChevronDown, Star, ShoppingCart, LogOut } from 'lucide-react'
import { useRouter } from "next/navigation"

interface UserDropdownProps {
  user: {
    name: string
    email: string
    image?: string
  }
  onLogout: () => void
  customIcon?: string
  isMobile?: boolean
}

export default function UserDropdown({ user, onLogout, customIcon, isMobile = false }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cerrar el dropdown cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    setIsOpen(false)
    onLogout()

    // Eliminar el usuario del localStorage
    localStorage.removeItem("user")
    localStorage.setItem("isAuth", "false")

    // Redirigir al inicio después de cerrar sesión
    router.push("/")
  }

  // Versión móvil - Layout completamente diferente
  if (isMobile) {
    return (
      <div className="w-full">
        {/* Avatar y info del usuario */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3">
            {user.image ? (
              <Image src={user.image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <h3 className="font-bold text-lg text-black">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>

        {/* Enlaces del usuario */}
        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/mi-aprendizaje"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
            className="w-full"
          >
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition text-black font-medium">
              <Image
                src="/logo-plomo.svg"
                alt="Logo Optimizador"
                width={20}
                height={20}
                className="object-contain"
              />
              Mi aprendizaje
            </button>
          </Link>

          <Link
            href="/mis-compras"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }))}
            className="w-full"
          >
            <button className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition text-black font-medium">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              Mis compras
            </button>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition font-medium"
          >
            <LogOut className="h-5 w-5" />
            Salir
          </button>
        </div>
      </div>
    )
  }

  // Versión desktop - Layout original con icono personalizado
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón del avatar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="relative w-8 h-8 rounded-full overflow-hidden">
          {user.image ? (
            <Image src={user.image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
              {user.name.charAt(0)}
            </div>
          )}
        </div>
      </button>

      {/* Menú desplegable */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
          <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-100">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              {user.image ? (
                <Image src={user.image || "/placeholder.svg"} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="py-1">
            <Link
              href="/mi-aprendizaje"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}>
              <Image
                src="/logo-plomo.svg"
                alt="Mi aprendizaje"
                width={16}
                height={16}
                className="object-contain"
              />
              Mi aprendizaje
            </Link>

            <Link
              href="/mis-compras"
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingCart className="h-4 w-4 text-gray-500" />
              Mis compras
            </Link>

            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4 text-gray-500" />
              Salir
            </button>
          </div>
        </div>
      )}
    </div>
  )
}