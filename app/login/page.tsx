"use client"

import type React from "react"

import Image from "next/image"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useAuthContext } from "@/context/AuthContext"

// Declarar tipos globales
declare global {
  interface Window {
    google: any
    googleScriptLoaded?: boolean
    googleInitPromise?: Promise<void> | null
  }
}

let googleClient: any = null

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get("redirect") || "/"
  const fromMiddleware = searchParams.get("from_middleware") === "true"
  const { login, isAuthenticated, isLoading } = useAuthContext()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  const [googleReady, setGoogleReady] = useState(false)
  const [googleError, setGoogleError] = useState("")
  const [googleLoading, setGoogleLoading] = useState(true)

  // Función para limpiar scripts existentes
  const cleanupGoogleScripts = () => {
    const existingScripts = document.querySelectorAll('script[src*="accounts.google.com"]')
    existingScripts.forEach((script) => {
      console.log("🧹 Removiendo script existente")
      script.remove()
    })

    // Limpiar variables globales - ahora con verificación de existencia
    if (window.google) {
      window.google = undefined
    }
    if (window.googleScriptLoaded) {
      window.googleScriptLoaded = undefined
    }
    if (window.googleInitPromise) {
      window.googleInitPromise = null
    }
  }

  // Función para cargar e inicializar Google
  const initializeGoogle = async () => {
    try {
      setGoogleLoading(true)
      setGoogleError("")
      console.log("🚀 Iniciando proceso de Google...")

      // Si ya hay una promesa en progreso, esperarla
      if (window.googleInitPromise) {
        console.log("⏳ Esperando inicialización en progreso...")
        await window.googleInitPromise
        return
      }

      // Crear nueva promesa de inicialización
      window.googleInitPromise = new Promise<void>(async (resolve, reject) => {
        try {
          // Limpiar scripts existentes primero
          cleanupGoogleScripts()

          console.log("📜 Cargando script de Google...")

          // Crear nuevo script
          const script = document.createElement("script")
          script.src = "https://accounts.google.com/gsi/client"
          script.async = true
          script.defer = true

          // Promesa para la carga del script
          const scriptPromise = new Promise<void>((scriptResolve, scriptReject) => {
            script.onload = () => {
              console.log("✅ Script de Google cargado")
              window.googleScriptLoaded = true
              scriptResolve()
            }

            script.onerror = (error) => {
              console.error("❌ Error al cargar script:", error)
              scriptReject(new Error("Failed to load Google script"))
            }
          })

          // Añadir script al DOM
          document.head.appendChild(script)

          // Esperar a que el script se cargue
          await scriptPromise

          // Esperar un poco más para que Google se inicialice completamente
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // Verificar que Google esté disponible
          if (!window.google?.accounts?.oauth2) {
            throw new Error("Google API no está disponible después de cargar el script")
          }

          console.log("🔧 Inicializando Google OAuth2 Client...")

          // Verificar que tenemos el client ID
          if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
            throw new Error("NEXT_PUBLIC_GOOGLE_CLIENT_ID no está configurado")
          }

          // Inicializar el cliente
          googleClient = window.google.accounts.oauth2.initTokenClient({
            client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
            scope: "email profile openid",
            callback: async (response: { access_token: string; error?: string }) => {
              console.log("📨 Respuesta de Google:", response)

              if (response.error) {
                console.error("❌ Error en respuesta de Google:", response.error)
                setGoogleError("Error al autenticar con Google")
                return
              }

              try {
                console.log("📤 Enviando token al backend...")
                const res = await api.post("/auth/register-google", {
                  access_token: response.access_token,
                })

                // Guardar datos
                localStorage.setItem("authToken", res.access_token)
                localStorage.setItem("isAuth", "true")
                localStorage.setItem("user", JSON.stringify(res.user))
                document.cookie = `authToken=${res.access_token}; path=/; max-age=86400`

                if (login) {
                  login(res.user, res.access_token)
                }

                console.log("✅ Login exitoso")

                // Redirigir
                const pendingCourseId = localStorage.getItem("pendingPurchaseCourseId")
                if (pendingCourseId) {
                  localStorage.removeItem("pendingPurchaseCourseId")
                  router.replace(`/checkout?courseId=${pendingCourseId}`)
                } else {
                  router.replace(redirectPath)
                }
              } catch (error: any) {
                console.error("❌ Error en backend:", error)
                setGoogleError("Error al procesar la autenticación")
              }
            },
          })

          console.log("✅ Google Client inicializado correctamente")
          resolve()
        } catch (error) {
          console.error("❌ Error en inicialización:", error)
          reject(error)
        }
      })

      // Esperar a que termine la inicialización
      await window.googleInitPromise
      setGoogleReady(true)
      console.log("🎉 Google listo para usar")
    } catch (error: any) {
      console.error("❌ Error general:", error)
      setGoogleError(error.message || "Error al inicializar Google")
      setGoogleReady(false)
    } finally {
      setGoogleLoading(false)
    }
  }

  // Inicializar Google al montar el componente
  useEffect(() => {
    // Solo inicializar si no estamos autenticados
    if (!isAuthenticated && !isLoading) {
      console.log("🔄 Componente montado, inicializando Google...")
      initializeGoogle()
    }

    // Cleanup al desmontar
    return () => {
      console.log("🧹 Limpiando componente...")
      if (window.googleInitPromise) {
        window.googleInitPromise = null
      }
    }
  }, [isAuthenticated, isLoading])

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && !hasRedirected) {
      console.log("👤 Usuario autenticado, redirigiendo...")
      setHasRedirected(true)

      const pendingCourseId = localStorage.getItem("pendingPurchaseCourseId")
      if (pendingCourseId) {
        localStorage.removeItem("pendingPurchaseCourseId")
        router.replace(`/checkout?courseId=${pendingCourseId}`)
      } else {
        router.replace(redirectPath)
      }
    }
  }, [isAuthenticated, isLoading, redirectPath, router, hasRedirected])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    setEmailError("")
    setPasswordError("")

    let isValid = true

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError("Correo electrónico inválido")
      isValid = false
    }

    if (password.trim() === "") {
      setPasswordError("La contraseña no puede estar vacía")
      isValid = false
    }

    if (isValid) {
      try {
        const res = await api.post("/auth/login", { email, password })

        localStorage.setItem("authToken", res.access_token)
        localStorage.setItem("isAuth", "true")
        localStorage.setItem("user", JSON.stringify(res.user))
        document.cookie = `authToken=${res.access_token}; path=/; max-age=86400`

        if (login) {
          login(res.user, res.access_token)
        }

        const pendingCourseId = localStorage.getItem("pendingPurchaseCourseId")
        if (pendingCourseId) {
          localStorage.removeItem("pendingPurchaseCourseId")
          router.replace(`/checkout?courseId=${pendingCourseId}`)
        } else {
          router.replace(redirectPath)
        }
      } catch (error) {
        console.error("❌ Error al iniciar sesión:", error)
        alert("Email o contraseña incorrecta")
      }
    }

    setIsSubmitting(false)
  }

  const handleGoogleLogin = () => {
    console.log("🔘 Botón de Google clickeado")

    if (!googleReady || !googleClient) {
      console.error("❌ Google no está listo")
      setGoogleError("Google no está listo. Intenta recargar la página.")
      return
    }

    try {
      console.log("🚀 Solicitando token de acceso...")
      googleClient.requestAccessToken()
    } catch (error) {
      console.error("❌ Error al solicitar token:", error)
      setGoogleError("Error al iniciar sesión con Google")
    }
  }

  const handleRetryGoogle = () => {
    console.log("🔄 Reintentando Google...")
    setGoogleError("")
    setGoogleReady(false)
    setGoogleLoading(true)

    // Limpiar promesa existente
    if (window.googleInitPromise) {
      window.googleInitPromise = null
    }

    // Reinicializar después de un breve delay
    setTimeout(initializeGoogle, 500)
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si ya está autenticado, mostrar mensaje de redirección
  if (isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ya has iniciado sesión. Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        <p className="text-black text-sm">
          Inicia sesión con tu cuenta o{" "}
          <Link href="/registro" className="text-orange-700 hover:text-orange-600">
            crea una nueva cuenta
          </Link>{" "}
          para poder comprar y acceder a los cursos, productos o eventos.
        </p>

        {fromMiddleware && (
          <div className="mt-4 p-3 bg-orange-100 text-orange-800 rounded-md">
            Necesitas iniciar sesión para acceder a esta página
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium">
            Correo electrónico
          </label>
          <Input
            id="email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-500"
          />
          {emailError && <p className="text-red-600 text-sm">{emailError}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block font-medium">
            Contraseña
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-md placeholder-gray-500"
          />
          {passwordError && <p className="text-red-600 text-sm">{passwordError}</p>}
        </div>

        <Button
          type="submit"
          className="w-full bg-orange-700 hover:bg-orange-600 font-semibold py-3 rounded-md"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Iniciando sesión..." : "Iniciar sesión"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o</span>
          </div>
        </div>

        {/* Botón de Google */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            disabled={googleLoading || !googleReady}
            className="w-full"
          >
            <Image src="/google.svg" alt="Google" width={20} height={20} className="mr-2" />
            {googleLoading ? "Cargando Google..." : !googleReady ? "Google no disponible" : "Iniciar sesión con Google"}
          </Button>

          {/* Errores y retry */}
          {googleError && (
            <div className="text-red-600 text-sm text-center">
              {googleError}
              <button
                type="button"
                onClick={handleRetryGoogle}
                className="ml-2 text-orange-600 hover:text-orange-700 underline"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Debug info en desarrollo */}
          {process.env.NODE_ENV === "development" && (
            <div className="text-xs text-gray-500 text-center">
              Debug: Loading: {googleLoading ? "✅" : "❌"} | Ready: {googleReady ? "✅" : "❌"} | Client ID:{" "}
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? "✅" : "❌"}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}
