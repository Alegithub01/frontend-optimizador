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

  useEffect(() => {
    if (detectedCountry && !formData.country) {
      const foundCountry = countries.find((c) => c.name.toLowerCase() === detectedCountry.toLowerCase())
      if (foundCountry) {
        setFormData((prev) => ({ ...prev, country: foundCountry }))
      } else {
        const bolivia = countries.find((c) => c.code === "BO")
        if (bolivia) {
          setFormData((prev) => ({ ...prev, country: bolivia }))
        }
      }
    }
  }, [detectedCountry, formData.country])

  useEffect(() => {
    const loadItemData = () => {
      try {
        const productData = localStorage.getItem("checkoutProduct")
        if (productData) {
          const parsedData = JSON.parse(productData)
          setItemData(parsedData)
          return
        }

        const eventData = localStorage.getItem("checkoutEvent")
        if (eventData) {
          const parsedData = JSON.parse(eventData)
          setItemData(parsedData)
          return
        }

        const courseData = localStorage.getItem("checkoutCourse")
        if (courseData) {
          const parsedData = JSON.parse(courseData)
          setItemData(parsedData)
          return
        }
      } catch (error) {
        console.error("Error al cargar datos del item:", error)
      }
    }

    loadItemData()
  }, [])

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.name?.split(" ")[0] || "",
        lastName: user.name?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
      }))
    }
  }, [user])

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

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

      const updatedItemData = {
        ...currentItemData,
        billingInfo,
        fullName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.country.phoneCode ? `${formData.country.phoneCode}${formData.phone}` : formData.phone,
        country: formData.country.name,
        shippingAddress: currentItemData.shippingAddress || formData.address,
      }

      if (itemType === "product") {
        localStorage.setItem("checkoutProduct", JSON.stringify(updatedItemData))
      } else if (itemType === "course") {
        localStorage.setItem("checkoutCourse", JSON.stringify(updatedItemData))
      } else if (itemType === "event") {
        localStorage.setItem("checkoutEvent", JSON.stringify(updatedItemData))
      }

      setItemData(updatedItemData)
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
          <h1 className="text-red-600">Es importante que llene sus datos correctamente, ya que si su compra es para algún evento, recojo en oficina o para un envio fisico se le validara su identidad mediante los datos que ponga.</h1>
          <CardDescription>Completa tus datos para procesar el pago</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    placeholder=""
                    className="rounded-l-none"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Ingresa tu número sin el código de país</p>
              </div>
            </div>
            <Separator />
            <Button type="submit" className="rounded-xl w-full bg-orange-500 hover:bg-orange-600" size="lg" disabled={isLoading}>
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