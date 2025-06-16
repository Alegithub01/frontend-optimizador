"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ProductSummaryData {
  id: string | number
  name?: string
  title?: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  type: "course" | "product" | "event" | "toolkit"
  category?: string
  format?: string
  department?: string
  isProvincialDelivery?: boolean
  // Campos específicos para eventos
  dateTime?: string
  location?: string
  capacity?: number
  availableSpots?: number
}

export default function ProductSummary() {
  const [itemData, setItemData] = useState<ProductSummaryData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadItemData = () => {
      try {
        // Primero buscar datos de producto
        const productData = localStorage.getItem("checkoutProduct")
        if (productData) {
          const product = JSON.parse(productData)
          setItemData({
            id: product.id,
            name: product.name,
            title: product.name, // Para compatibilidad
            price: product.price,
            originalPrice: product.originalPrice,
            discount: product.discount,
            image: product.image,
            type: "product",
            category: product.category,
            format: product.format,
            department: product.department,
            isProvincialDelivery: product.isProvincialDelivery,
          })
          console.log("Cargando datos de producto:", product)
          return
        }

        // Si no hay producto, buscar datos de evento
        const eventData = localStorage.getItem("checkoutEvent")
        if (eventData) {
          const event = JSON.parse(eventData)
          setItemData({
            id: event.id,
            name: event.title,
            title: event.title,
            price: event.price,
            originalPrice: event.originalPrice,
            discount: event.discount,
            image: event.image,
            type: "event",
            dateTime: event.dateTime,
            location: event.location,
            capacity: event.capacity,
            availableSpots: event.availableSpots,
          })
          console.log("Cargando datos de evento:", event)
          return
        }

        // Si no hay producto, buscar datos de curso
        const courseData = localStorage.getItem("checkoutCourse")
        if (courseData) {
          const course = JSON.parse(courseData)
          setItemData({
            id: course.id,
            name: course.title,
            title: course.title,
            price: course.price,
            originalPrice: course.originalPrice,
            discount: course.discount,
            image: course.image,
            type: "course",
          })
          console.log("Cargando datos de curso:", course)
          return
        }

        console.warn("No se encontraron datos de producto o curso en localStorage")
      } catch (error) {
        console.error("Error al cargar datos del item:", error)
      } finally {
        setLoading(false)
      }
    }

    loadItemData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de compra</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!itemData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resumen de compra</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No se encontraron datos del producto</p>
        </CardContent>
      </Card>
    )
  }

  // Calcular precio final - con validación de tipos
  const parsePrice = (price: any): number => {
    if (typeof price === "string") {
      const parsed = Number.parseFloat(price)
      return isNaN(parsed) ? 0 : parsed
    }
    if (typeof price === "number") {
      return isNaN(price) ? 0 : price
    }
    return 0
  }

  const originalPrice = parsePrice(itemData.originalPrice || itemData.price)
  const currentPrice = parsePrice(itemData.price)
  const discountPercentage = itemData.discount || 0
  const discountAmount = discountPercentage > 0 ? (originalPrice * discountPercentage) / 100 : 0
  const finalPrice = originalPrice - discountAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumen de compra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Imagen y título del producto/curso */}
        <div className="flex gap-4">
          <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={itemData.image || "/placeholder.svg?height=80&width=80"}
              alt={itemData.name || itemData.title || "Producto"}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-sm leading-tight">{itemData.name || itemData.title}</h3>
            <div className="text-xs text-gray-500 mt-1">
              {itemData.type === "event" ? (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Evento</span>
              ) : itemData.type === "toolkit" ? (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Toolkit</span>
              ) : itemData.type === "course" ? (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Curso</span>
              ) : (
                <div className="space-y-1">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded capitalize">{itemData.category}</span>
                  {itemData.format && (
                    <div className="text-xs text-gray-600">
                      Formato: <span className="capitalize">{itemData.format}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información de envío para productos físicos */}
        {itemData.type === "product" && itemData.format === "fisico" && itemData.department && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <div className="font-medium text-blue-900 mb-1">Información de envío:</div>
            <div className="text-blue-700">
              <div>📍 {itemData.department}</div>
              {itemData.isProvincialDelivery && <div className="text-xs mt-1">🚚 Envío a provincia</div>}
            </div>
          </div>
        )}

        {/* Información de evento */}
        {itemData.type === "event" && itemData.dateTime && itemData.location && (
          <div className="bg-blue-50 p-3 rounded-lg text-sm">
            <div className="font-medium text-blue-900 mb-1">Información del evento:</div>
            <div className="text-blue-700">
              <div>
                📅{" "}
                {new Date(itemData.dateTime).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <div>📍 {itemData.location}</div>
              {itemData.availableSpots && (
                <div className="text-xs mt-1">🎫 {itemData.availableSpots} cupos disponibles</div>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Desglose de precios */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Precio original:</span>
            <span>${originalPrice.toFixed(2)} USD</span>
          </div>

          {discountPercentage > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Descuento ({discountPercentage}%):</span>
              <span>-${discountAmount.toFixed(2)} USD</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>${finalPrice.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Información adicional */}
        <div className="text-xs text-gray-500 text-center pt-2">
          {itemData.type === "event" ? (
            <p>🎫 Reserva confirmada después del pago</p>
          ) : itemData.type === "course" ? (
            <p>✅ Acceso inmediato después del pago</p>
          ) : itemData.format === "digital" ? (
            <p>📱 Descarga inmediata después del pago</p>
          ) : (
            <p>📦 Envío en 1-3 días hábiles</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
