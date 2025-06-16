"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: number
  name: string
  email: string
}

interface AuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: User | null
  login: (userData: any, token: string) => void
  logout: () => void
}

// Crear una versión simplificada del hook de autenticación
function useAuthSimple() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null)

  // Verificar autenticación al cargar
  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") {
      return
    }

    const checkAuth = () => {
      try {
        const token = localStorage.getItem("authToken")
        const userData = localStorage.getItem("user")

        console.log("AuthContext: verificando autenticación", { token: !!token, userData: !!userData })

        if (token && userData) {
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsAuthenticated(true)

          // Sincronizar con cookies para el middleware
          document.cookie = `authToken=${token}; path=/; max-age=86400` // 24 horas

          console.log("AuthContext: usuario autenticado", parsedUser)
        } else {
          setIsAuthenticated(false)
          setUser(null)

          // Limpiar cookies
          document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("authToken")
        localStorage.removeItem("user")
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
        setIsAuthenticated(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: any, token: string) => {
    console.log("AuthContext: login llamado", { userData, token })
    setUser(userData)
    setIsAuthenticated(true)
    setIsLoading(false)

    // Guardar en localStorage
    localStorage.setItem("authToken", token)
    localStorage.setItem("user", JSON.stringify(userData))
    localStorage.setItem("isAuth", "true")

    // Guardar en cookies para el middleware
    document.cookie = `authToken=${token}; path=/; max-age=86400` // 24 horas
  }

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
      localStorage.removeItem("isAuth")

      // Limpiar cookies
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    }
    setUser(null)
    setIsAuthenticated(false)
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const auth = useAuthSimple()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider")
  }
  return context
}
