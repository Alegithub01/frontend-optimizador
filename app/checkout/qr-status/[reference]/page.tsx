"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function QrStatusPage({ params }: { params: { reference: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [status, setStatus] = useState<"pending" | "paid" | "expired" | "error">("pending")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastChecked, setLastChecked] = useState<Date>(new Date())

  const reference = params.reference

  useEffect(() => {
    checkPaymentStatus()

    // Verificar estado cada 10 segundos
    const interval = setInterval(checkPaymentStatus, 10000)

    return () => clearInterval(interval)
  }, [reference])

  // Actualizar la función checkPaymentStatus para usar directamente el endpoint del backend

  const checkPaymentStatus = async () => {
    try {
      setLoading(true)

      console.log(`Verificando estado del pago con referencia: ${reference}`)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qr/estado/${reference}`,
        {
          method: "GET",
          headers: {
            ...(localStorage.getItem("authToken") && { Authorization: `Bearer ${localStorage.getItem("authToken")}` }),
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Error al verificar el estado: ${response.status}`)
      }

      const statusData = await response.json()
      console.log("Estado del pago:", statusData)
      setLastChecked(new Date())

      if (statusData.estado === "PAGADO") {
        setStatus("paid")
        // Redirigir a la página de éxito después de un breve retraso
        setTimeout(() => {
          router.push("/checkout/success")
        }, 3000)
      } else if (statusData.estado === "EXPIRADO") {
        setStatus("expired")
      } else {
        setStatus("pending")
      }
    } catch (error: any) {
      console.error("Error al verificar estado del pago:", error)
      setStatus("error")
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString()
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Estado del Pago QR</CardTitle>
          <CardDescription className="text-center">Referencia: {reference}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center py-6">
          {loading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-4" />
              <p className="text-lg font-medium">Verificando el estado del pago...</p>
              <p className="text-sm text-gray-500 mt-2">
                Esto puede tomar unos momentos. Por favor, no cierres esta ventana.
              </p>
            </div>
          ) : status === "paid" ? (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-700">¡Pago completado con éxito!</p>
              <p className="text-sm text-gray-500 mt-2">
                Tu compra ha sido procesada correctamente. Redirigiendo a la página de confirmación...
              </p>
            </div>
          ) : status === "expired" ? (
            <div className="flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
              <p className="text-lg font-medium text-amber-700">El código QR ha expirado</p>
              <p className="text-sm text-gray-500 mt-2">
                El tiempo para realizar el pago ha expirado. Por favor, genera un nuevo código QR.
              </p>
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-700">Error al verificar el pago</p>
              <p className="text-sm text-gray-500 mt-2">
                No pudimos verificar el estado de tu pago. Por favor, intenta nuevamente.
              </p>
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md w-full">
                  <p className="font-medium">Error:</p>
                  <p>{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-4" />
              <p className="text-lg font-medium">Esperando confirmación del pago...</p>
              <p className="text-sm text-gray-500 mt-2">
                Por favor, completa el pago en tu aplicación bancaria. Esta página se actualizará automáticamente.
              </p>
              <p className="text-xs text-gray-400 mt-4">Última verificación: {formatTime(lastChecked)}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "paid" ? (
            <Button onClick={() => router.push("/checkout/success")} className="bg-green-500 hover:bg-green-600">
              Ir a confirmación
            </Button>
          ) : status === "expired" ? (
            <Button onClick={() => router.push("/checkout")} className="bg-orange-500 hover:bg-orange-600">
              Volver al checkout
            </Button>
          ) : status === "error" ? (
            <Button onClick={checkPaymentStatus} className="bg-orange-500 hover:bg-orange-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Verificar nuevamente
            </Button>
          ) : (
            <Button onClick={checkPaymentStatus} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar estado
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
