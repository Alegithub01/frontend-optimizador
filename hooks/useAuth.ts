"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  email: string
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  // Verificar autenticación al cargar el componente
  useEffect(() => {
    checkAuth()
  }, [])

  // Función para verificar autenticación
  const checkAuth = () => {
    setIsLoading(true)

    // Verificar si hay un token en localStorage
    const token = localStorage.getItem("authToken")

    if (token) {
      // Aquí podrías validar el token con tu backend
      setIsAuthenticated(true)

      try {
        // Intentar obtener datos del usuario desde localStorage
        const userData = localStorage.getItem("userData")
        if (userData) {
          setUser(JSON.parse(userData))
        } else {
          // Si no hay datos de usuario pero sí token, establecer datos básicos
          setUser({
            id: 1,
            name: "Usuario",
            email: "usuario@ejemplo.com",
          })
          // Guardar en localStorage para futuras referencias
          localStorage.setItem(
            "userData",
            JSON.stringify({
              id: 1,
              name: "Usuario",
              email: "usuario@ejemplo.com",
            }),
          )
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    } else {
      setIsAuthenticated(false)
      setUser(null)
    }

    setIsLoading(false)
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)

    try {
      // Simulamos una llamada a la API
      // En un caso real, aquí harías una petición a tu backend
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Simular login exitoso
      const userData = {
        id: 1,
        name: email.split("@")[0],
        email,
      }

      // Guardar token y datos de usuario
      localStorage.setItem("authToken", "fake-token-" + Date.now())
      localStorage.setItem("userData", JSON.stringify(userData))

      setIsAuthenticated(true)
      setUser(userData)
      setIsLoading(false)

      return true
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("userData")
    setIsAuthenticated(false)
    setUser(null)
    router.push("/")
  }

  return {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    checkAuth,
  }
}
