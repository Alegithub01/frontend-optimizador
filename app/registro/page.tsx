"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { api } from "@/lib/api"
import { useRouter } from 'next/navigation'
import { useAuthContext } from "@/context/AuthContext"

let googleClient: any = null

declare global {
  interface Window {
    google: any
  }
}


// Esquema de validación
const registerSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  email: z.string().email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres")
})

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    apellido: "",
    email: "",
    password: ""
  })
  const { login } = useAuthContext()
  const router = useRouter() 

  const [isAuthenticated,setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuth")
    setIsAuthenticated(storedAuth === "true")
  }, [])


  const handleLogin = () => {
    setIsAuthenticated(true)
    localStorage.setItem("isAuth", "true")
  }
  
useEffect(() => {
  if (typeof window !== "undefined" && window.google && window.google.accounts?.oauth2) {
    googleClient = window.google.accounts.oauth2.initTokenClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: "email profile openid",
      callback: async (response: { access_token: string }) => {
        const accessToken = response.access_token
        console.log("ACCESS TOKEN:", accessToken)

        try {
          console.log(process.env.NEXT_PUBLIC_API_URL);
          const res = await api.post("/auth/register-google", { access_token: accessToken })
          console.log("Respuesta del backend:", res.data)
          alert("Cuenta creada exitosamente")
          login(res.user, res.access_token)
          handleLogin()
          router.push("/")
        } catch (error: any) {
          console.error("Error al mandar token al backend:", error)
        }
      }
    })
  } else {
    console.log(process.env.NEXT_PUBLIC_API_URL);
    console.error("Google script aún no cargado o window.google no disponible")
  }
}, [])

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error al cambiar el valor
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    try {
      registerSchema.parse(formData)
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof FormData, string>> = {}
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof FormData] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!validateForm()) return
  
  setIsSubmitting(true)
  
  try {
    const payload = {
      email: formData.email,
      password: formData.password,
      name: formData.nombre,     // 👈 cambiás el nombre del campo para que coincida con el DTO
      surname: formData.apellido // 👈 igual aquí
    }

    const res = await api.post("/users", payload)
    alert("Cuenta creada exitosamente")
    console.log("Respuesta:", res)
    router.push("/login") 
  } catch (error: any) {
    console.error("Error al crear cuenta:", error)
    alert("Error al crear la cuenta: Email invalido " + error.message)
  } finally {
    setIsSubmitting(false)
  }
}


  return (
    <div className="container mx-auto max-w-md py-16 px-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">Crea tu cuenta</h1>
        <p className="text-gray-600 text-sm">
          Proporciona tus datos para poder crear tu cuenta y acceder a todos los cursos, eventos y productos disponibles
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="nombre" className="block font-medium">
            Nombre
          </label>
          <Input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Ingresa tu nombre"
            value={formData.nombre}
            onChange={handleChange}
            className={`w-full p-3 border ${errors.nombre ? "border-red-500" : "border-gray-300"} rounded-md`}
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="apellido" className="block font-medium">
            Apellido
          </label>
          <Input
            id="apellido"
            name="apellido"
            type="text"
            placeholder="Ingresa tu apellido"
            value={formData.apellido}
            onChange={handleChange}
            className={`w-full p-3 border ${errors.apellido ? "border-red-500" : "border-gray-300"} rounded-md`}
          />
          {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block font-medium">
            Correo electrónico
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Ingresa tu correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-md`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block font-medium">
            Contraseña
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            value={formData.password}
            onChange={handleChange}
            className={`w-full p-3 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-md`}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-orange-700 hover:bg-orange-600 text-white font-medium py-3 rounded-md"
        >
          {isSubmitting ? "Creando cuenta..." : "Crear mi cuenta"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">o</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full border border-gray-300 flex items-center justify-center gap-2 py-3 rounded-md"
          onClick={() => {
            if (googleClient) {
              googleClient.requestAccessToken()
            } else {
              console.error("Google client no inicializado")
            }
          }}
        >
          <Image src="/google.svg" alt="Google" width={20} height={20} />
          <span>Ingresar con Google</span>
        </Button>

        <div className="text-center text-sm text-gray-500">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/login" className="text-orange-700 hover:text-orange-600">
            Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  )
}

