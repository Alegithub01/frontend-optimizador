"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function QrStatusPage({ params }: { params: { reference: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<string>("pending")
  const [tipoVenta, setTipoVenta] = useState<"course" | "product" | "event" | null>(null)
  const [deliveryType, setDeliveryType] = useState<"digital" | "physical" | null>(null)
  const [detalle, setDetalle] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const reference = params.reference

  useEffect(() => {
    checkPaymentStatus()
  }, [reference])

  const checkPaymentStatus = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qr/estado/${reference}`,
        {
          method: "GET",
          headers: {
            ...(localStorage.getItem("authToken") && {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            }),
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Error al verificar el estado: ${response.status}`)
      }

      const data = await response.json()
      setStatus(data.estado)
      setDetalle(data.detalle)
      setTipoVenta(data.tipoVenta || null)
      setDeliveryType(data.deliveryType || null) // <-- requiere que tu backend también lo devuelva
      setLastChecked(new Date())
    } catch (error: any) {
      console.error("Error al verificar estado del pago:", error)
      setStatus("ERROR")
      setError(error.message || "Error al verificar el estado del pago")
      toast({
        title: "Error",
        description: "No se pudo verificar el estado del pago",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderPaidMessage = () => {
    if (tipoVenta === "course") {
      return (
        <>
          <p className="text-lg font-medium text-green-700">¡Pago confirmado!</p>
          <p className="text-sm text-gray-600 mt-2">
            Ya puedes acceder a tu curso desde{" "}
            <a href="/mi-aprendizaje" className="text-blue-600 underline">
              tu panel de aprendizaje
            </a>.
          </p>
        </>
      )
    }

    if (tipoVenta === "product") {
      return (
        <>
          <p className="text-lg font-medium text-green-700">¡Compra registrada!</p>
          <p className="text-sm text-gray-600 mt-2">
            Puedes gestionar tu compra desde{" "}
            <a href="/mis-compras" className="text-blue-600 underline">
              Mis Compras
            </a>.
          </p>
          {deliveryType === "physical" && (
            <p className="text-sm text-gray-600 mt-2">
              Como tu compra incluye envío físico o recojo en oficina, puedes solicitar detalles por{" "}
              <a
                href="https://wa.me/59177419374"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                WhatsApp
              </a>.
            </p>
          )}
        </>
      )
    }

    if (tipoVenta === "event") {
      return (
        <>
          <p className="text-lg font-medium text-green-700">¡Entrada confirmada!</p>
          <p className="text-sm text-gray-600 mt-2">
            El día del evento deberás presentar tu comprobante de pago. Si pagaste con tarjeta, lleva también una
            copia del recibo o una foto.
          </p>
        </>
      )
    }

    return (
      <>
        <p className="text-lg font-medium text-green-700">¡Pago registrado!</p>
        <p className="text-sm text-gray-600 mt-2">Gracias por tu compra.</p>
      </>
    )
  }

  const renderStatusContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center">
          <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-4" />
          <p className="text-lg font-medium">Verificando el estado del pago...</p>
        </div>
      )
    }

    if (status === "SUCCESS" || status === "CLOSED") {
      return (
        <div className="flex flex-col items-center">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          {renderPaidMessage()}
        </div>
      )
    }

    if (status === "EXPIRED" || status === "CANCELLED") {
      return (
        <div className="flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
          <p className="text-lg font-medium text-amber-700">Pago no realizado</p>
          <p className="text-sm text-gray-600 mt-2">
            {detalle || "La transacción no se completó a tiempo."}
          </p>
        </div>
      )
    }

    if (status === "ERROR" || status === "NOTFOUND") {
      return (
        <div className="flex flex-col items-center">
          <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
          <p className="text-lg font-medium text-red-700">Error al verificar</p>
          <p className="text-sm text-gray-600 mt-2">
            {detalle || "No se pudo obtener el estado de la transacción."}
          </p>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center">
        <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-4" />
        <p className="text-lg font-medium">Transacción pendiente...</p>
        <p className="text-sm text-gray-500 mt-2">Espera unos minutos o vuelve a verificar.</p>
      </div>
    )
  }

  const formatTime = (date: Date) => date.toLocaleTimeString()

  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Estado del Pago QR</CardTitle>
          <CardDescription className="text-center">Referencia: {reference}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {renderStatusContent()}
          <p className="text-xs text-gray-400 mt-4">Última verificación: {formatTime(lastChecked)}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={checkPaymentStatus} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Verificar estado
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
