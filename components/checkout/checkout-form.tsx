"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CountrySelector, countries, type Country } from "./country-selector"
import { useAuthContext } from "@/context/AuthContext"
import PaymentOptions from "./payment-options"
import { useToast } from "@/components/ui/use-toast"

interface CheckoutFormProps {
  country?: string | null
  courseId?: number
  productId?: string
}

// Actualizar el estado para usar undefined en lugar de null
interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: Country | undefined
}

export default function CheckoutForm({ country: detectedCountry, courseId }: CheckoutFormProps) {
  const router = useRouter()
  const { user } = useAuthContext()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [itemData, setItemData] = useState<any>(null)

  // Actualizar el estado inicial
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: undefined,
  })

  // Auto-detectar país al cargar
  useEffect(() => {
    if (detectedCountry && !formData.country) {
      const foundCountry = countries.find((c) => c.name.toLowerCase() === detectedCountry.toLowerCase())
      if (foundCountry) {
        setFormData((prev) => ({ ...prev, country: foundCountry }))
      } else {
        // Si es Bolivia o no se encuentra, usar Bolivia por defecto
        const bolivia = countries.find((c) => c.code === "BO")
        if (bolivia) {
          setFormData((prev) => ({ ...prev, country: bolivia }))
        }
      }
    }
  }, [detectedCountry, formData.country])

  // Cargar datos del item (producto, curso o evento)
  useEffect(() => {
    const loadItemData = () => {
      try {
        // Primero buscar datos de producto
        const productData = localStorage.getItem("checkoutProduct")
        if (productData) {
          const parsedData = JSON.parse(productData)
          console.log("Datos de producto cargados:", parsedData)
          setItemData(parsedData)
          return
        }

        // Si no hay producto, buscar datos de evento
        const eventData = localStorage.getItem("checkoutEvent")
        if (eventData) {
          const parsedData = JSON.parse(eventData)
          console.log("Datos de evento cargados:", parsedData)
          setItemData(parsedData)
          return
        }

        // Si no hay evento, buscar datos de curso
        const courseData = localStorage.getItem("checkoutCourse")
        if (courseData) {
          const parsedData = JSON.parse(courseData)
          console.log("Datos de curso cargados:", parsedData)
          setItemData(parsedData)
          return
        }
      } catch (error) {
        console.error("Error al cargar datos del item:", error)
      }
    }

    loadItemData()
  }, [])

  // Corregir el useEffect para pre-llenar datos del usuario
  useEffect(() => {
    if (user) {
      console.log("Datos de usuario disponibles:", user)
      setFormData((prev) => ({
        ...prev,
        // Usar propiedades que existen en tu tipo User
        firstName: user.name?.split(" ")[0] || "", // Extraer primer nombre si existe
        lastName: user.name?.split(" ").slice(1).join(" ") || "", // Extraer apellidos si existe
        email: user.email || "",
      }))
    }
  }, [user])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Actualizar la función handleCountryChange
  const handleCountryChange = (country: Country) => {
    setFormData((prev) => ({ ...prev, country }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.country) {
      toast({
        title: "Error",
        description: "Por favor selecciona un país",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Obtener datos del producto o curso desde localStorage
      const productData = localStorage.getItem("checkoutProduct")
      const courseData = localStorage.getItem("checkoutCourse")
      const eventData = localStorage.getItem("checkoutEvent")

      let currentItemData
      let itemType = "course"

      if (productData) {
        currentItemData = JSON.parse(productData)
        itemType = "product"
      } else if (courseData) {
        currentItemData = JSON.parse(courseData)
        itemType = "course"
      } else if (eventData) {
        currentItemData = JSON.parse(eventData)
        itemType = "event"
      } else {
        throw new Error("No se encontraron datos del producto, curso o evento")
      }

      console.log("Procesando pago para:", itemType, currentItemData)

      // Preparar datos para el backend
      const billingInfo = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.country.phoneCode ? `${formData.country.phoneCode}${formData.phone}` : formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        country: formData.country.name,
        countryCode: formData.country.code,
      }

      console.log("Información de facturación:", billingInfo)

      // Actualizar el item con la información de facturación
      const updatedItemData = {
        ...currentItemData,
        billingInfo,
        // Asegurarse de que la información de envío esté disponible para productos físicos
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.country.phoneCode ? `${formData.country.phoneCode}${formData.phone}` : formData.phone,
        country: formData.country.name,
        // Si no hay dirección de envío específica, usar la dirección de facturación
        shippingAddress: currentItemData.shippingAddress || formData.address,
      }

      console.log("Datos actualizados del item:", updatedItemData)

      // Guardar información actualizada en localStorage
      if (itemType === "product") {
        localStorage.setItem("checkoutProduct", JSON.stringify(updatedItemData))
      } else if (itemType === "course") {
        localStorage.setItem("checkoutCourse", JSON.stringify(updatedItemData))
      } else if (itemType === "event") {
        localStorage.setItem("checkoutEvent", JSON.stringify(updatedItemData))
      }

      setItemData(updatedItemData)

      // Mostrar opciones de pago
      setShowPaymentOptions(true)
    } catch (error) {
      console.error("Error al procesar el pago:", error)
      toast({
        title: "Error",
        description: "Error al procesar el pago. Por favor intenta nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Información de Cliente</CardTitle>
          <CardDescription>Completa tus datos para procesar el pago</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre *</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  required
                  placeholder="Tu nombre"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido *</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required
                  placeholder="Tu apellido"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                placeholder="tu@email.com"
              />
            </div>

            <Separator />

            {/* Información de contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de contacto</h3>

              <div className="space-y-2">
                <Label>País *</Label>
                <CountrySelector
                  value={formData.country}
                  onValueChange={handleCountryChange}
                  placeholder="Selecciona tu país"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Número de teléfono *</Label>
                <div className="flex">
                  <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                    <span className="text-sm font-medium">{formData.country?.phoneCode || "+591"}</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    placeholder="70123456"
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Ingresa tu número sin el código de país</p>
              </div>
            </div>
            <Separator />
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" size="lg" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando...
                </div>
              ) : (
                "Proceder al pago"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {showPaymentOptions && itemData && (
        <PaymentOptions itemData={itemData} onClose={() => setShowPaymentOptions(false)} />
      )}
    </>
  )
}
