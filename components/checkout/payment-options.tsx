"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { CreditCard, Loader2, X, QrCode, RefreshCw, Copy, Check, Download, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/context/AuthContext"
import Image from "next/image"
import { generateQrPayment, prepareQrData } from "@/services/qr-payment-service"

interface PaymentOptionsProps {
  itemData: any
  onClose: () => void
}

export default function PaymentOptions({ itemData, onClose }: PaymentOptionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingQr, setIsLoadingQr] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [qrData, setQrData] = useState<any>(null)
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  // Actualizar el tiempo restante cada segundo
  useEffect(() => {
    if (!qrData) return

    // Calcular tiempo de expiración (15 minutos después de la generación)
    const qrGeneratedTime = new Date(qrData.qr.fechaHora).getTime()
    const expirationTime = qrGeneratedTime + 15 * 60 * 1000 // 15 minutos en milisegundos

    const updateTimeLeft = () => {
      const now = new Date().getTime()
      const remaining = Math.max(0, Math.floor((expirationTime - now) / 1000))
      setTimeLeft(remaining)

      if (remaining <= 0) {
        clearInterval(interval)
        toast({
          title: "QR expirado",
          description: "El código QR ha expirado. Por favor genera uno nuevo.",
          variant: "destructive",
        })
      }
    }

    // Actualizar inmediatamente
    updateTimeLeft()

    // Luego actualizar cada segundo
    const interval = setInterval(updateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [qrData, toast])

  const handleStripeCheckout = async () => {
    setIsLoading(true)
    setDebugInfo(null)

    try {
      if (!user?.id) {
        throw new Error("Usuario no autenticado")
      }

      // Log the raw item data received from the checkout form
      console.log("DATOS RECIBIDOS DEL FORMULARIO:", itemData)

      // Extract billing info
      const billingInfo = itemData.billingInfo || {}
      console.log("INFORMACIÓN DE FACTURACIÓN:", billingInfo)

      // Prepare data for the backend
      const checkoutData = {
        name: itemData.name || itemData.title || "Producto sin nombre",
        price: typeof itemData.price === "number" ? itemData.price * 100 : Number(itemData.price) * 100,
        image: itemData.image || "/placeholder.svg",
        userId: String(user.id),
        type: itemData.type || "product",
        deliveryType: itemData.format || "digital",

        // Add IDs based on type
        ...(itemData.type === "course" && { courseId: String(itemData.id) }),
        ...(itemData.type === "product" && { productId: String(itemData.id) }),
        ...(itemData.type === "event" && { eventId: String(itemData.id) }),

        // Add shipping info with customer details - THIS IS THE KEY PART
        shippingInfo: {
          fullName:
            billingInfo.firstName && billingInfo.lastName
              ? `${billingInfo.firstName} ${billingInfo.lastName}`
              : itemData.fullName || "",
          phone: billingInfo.phone || itemData.phone || "",
          country: billingInfo.country || itemData.country || "Bolivia",
          department: itemData.department || "",
          departmentName: itemData.departmentName || "",
          isProvincialDelivery: itemData.needsHomeDelivery || false,
          address: itemData.shippingAddress || billingInfo.address || "",
        },
      }

      // Log the data being sent to the backend
      console.log("DATOS ENVIADOS AL BACKEND:", JSON.stringify(checkoutData, null, 2))
      setDebugInfo(JSON.stringify(checkoutData, null, 2))

      // Call your backend API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          ...(localStorage.getItem("authToken") && { Authorization: `Bearer ${localStorage.getItem("authToken")}` }),
        },
        body: JSON.stringify(checkoutData),
      })

      // If response is not ok, try to get the error message from the response
      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error response from server:", errorText)

        let errorMessage = `Error: ${response.status}`
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch (e) {
          // If parsing fails, use the raw text
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()
      console.log("RESPUESTA DEL SERVIDOR:", data)

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received from server")
      }
    } catch (error: any) {
      console.error("Error processing payment:", error)
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al procesar el pago. Por favor intenta nuevamente.",
        variant: "destructive",
      })

      // Show debug info in development
      if (process.env.NODE_ENV === "development") {
        setDebugInfo(error.message || "Unknown error")
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Modificar la función que muestra el QR para asegurar que se visualice correctamente
  const handleGenerateQr = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar un pago",
        variant: "destructive",
      })
      return
    }

    setIsLoadingQr(true)
    try {
      // Preparar datos para el QR
      const userId = String(user.id)
      const qrRequestData = prepareQrData(itemData, userId)
      console.log("Datos para generar QR:", qrRequestData)

      const response = await generateQrPayment(qrRequestData)
      console.log("QR generado:", response)

      // Verificar que la respuesta tenga la estructura esperada
      if (response && response.qr) {
        setQrData(response)
      } else {
        console.error("Formato de respuesta QR inesperado:", response)
        toast({
          title: "Error",
          description: "El formato de la respuesta QR es incorrecto",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Error al generar QR:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el código QR",
        variant: "destructive",
      })
    } finally {
      setIsLoadingQr(false)
    }
  }

  const handleVerifyQrPayment = () => {
    if (qrData) {
      router.push(`/checkout/qr-status/${qrData.qr.numeroReferencia}`)
    }
  }

  const copyQrString = () => {
    if (!qrData?.qr.qrString) return

    navigator.clipboard.writeText(qrData.qr.qrString)
    setCopied(true)
    toast({
      title: "Copiado",
      description: "Código QR copiado al portapapeles",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQrImage = () => {
    if (!qrData?.qr.qrImage) return

    // Crear un enlace temporal para descargar la imagen
    const link = document.createElement("a")
    link.href = qrData.qr.qrImage
    link.download = `qr-pago-${qrData.qr.numeroReferencia}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Descargado",
      description: "Imagen QR descargada correctamente",
    })
  }

  const formatTimeLeft = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Calcular el precio en bolivianos
  const getPriceInBOB = () => {
    const priceUSD = typeof itemData.price === "number" ? itemData.price : Number.parseFloat(itemData.price || "0")
    const exchangeRate = 6.96 // Tipo de cambio fijo para Bolivia: 1 USD = 6.96 BOB
    const priceBOB = Math.round(priceUSD * exchangeRate * 100) / 100 // Redondear a 2 decimales
    return priceBOB.toFixed(2)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-w-[95vw] max-h-[95vh] bg-white overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 pb-2">
          <DialogTitle className="text-lg sm:text-xl">Opciones de Pago</DialogTitle>
          <DialogDescription className="text-sm">
            Selecciona tu método de pago preferido para completar la compra.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="card" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-3">
              <TabsTrigger value="card" className="text-sm">Tarjeta</TabsTrigger>
              <TabsTrigger value="qr" className="text-sm">QR</TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Pago con Tarjeta</CardTitle>
                  <CardDescription className="text-sm">Pago seguro procesado por Stripe</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="flex items-center justify-center p-3 sm:p-4 border rounded-md bg-gray-50">
                    <CreditCard className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-sm sm:text-base">Tarjeta de Crédito/Débito</p>
                      <p className="text-xs sm:text-sm text-gray-500">Visa, Mastercard, American Express</p>
                    </div>
                  </div>

                  {/* Debug information in development */}
                  {process.env.NODE_ENV === "development" && debugInfo && (
                    <div className="mt-4 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs font-medium text-red-800">Debug Info:</p>
                      <pre className="text-xs overflow-auto max-h-32 p-2 bg-gray-100 rounded mt-1">{debugInfo}</pre>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0">
                  <Button
                    onClick={handleStripeCheckout}
                    disabled={isLoading}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-sm sm:text-base"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Continuar al Pago"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="qr" className="mt-0">
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Pago con QR</CardTitle>
                  <CardDescription className="text-sm">
                    Paga escaneando un código QR con tu aplicación bancaria
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                  {qrData ? (
                    <div className="space-y-4">
                      {/* QR Code y información principal */}
                      <div className="flex flex-col items-center space-y-3">
                        <div className="bg-white p-3 rounded-lg border shadow-sm">
                          {qrData.qr && (qrData.qr.qrImage || qrData.qr.imagen) ? (
                            <Image
                              src={qrData.qr.qrImage || `data:image/png;base64,${qrData.qr.imagen}` || "/placeholder.svg"}
                              alt="Código QR de pago"
                              width={180}
                              height={180}
                              className="mx-auto"
                            />
                          ) : (
                            <div className="w-[180px] h-[180px] bg-gray-100 flex items-center justify-center">
                              <p className="text-gray-500 text-sm">QR no disponible</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Monto y referencia */}
                        <div className="text-center">
                          <p className="text-xl font-bold text-green-600">{getPriceInBOB()} BOB</p>
                          <p className="text-xs text-gray-500 break-all">
                            Ref: {(qrData.qr.numeroReferencia || qrData.numeroReferencia || "").slice(0, 16)}...
                          </p>
                        </div>
                      </div>

                      {/* BOTÓN DE VERIFICACIÓN PROMINENTE */}
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                        <Button 
                          onClick={handleVerifyQrPayment} 
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 text-base"
                          size="lg"
                        >
                          <Eye className="mr-2 h-5 w-5" />
                          Verificar Estado del Pago
                        </Button>
                        <p className="text-xs text-orange-700 text-center mt-2">
                          Haz clic aquí después de realizar el pago para verificar el estado
                        </p>
                      </div>

                      {/* Tiempo restante */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-800">Tiempo restante</span>
                          <span className="text-sm font-bold text-blue-600">{formatTimeLeft(timeLeft)}</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Acciones secundarias */}
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm"
                          onClick={downloadQrImage}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Descargar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-sm"
                          onClick={copyQrString}
                        >
                          {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                          {copied ? "¡Copiado!" : "Copiar"}
                        </Button>
                      </div>

                      {/* Instrucciones compactas */}
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="font-medium text-gray-800 text-sm mb-2">Pasos para pagar:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-gray-600">
                          <div>1. Abrir app bancaria</div>
                          <div>2. Seleccionar pago QR</div>
                          <div>3. Escanear código</div>
                          <div>4. Confirmar pago</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 border rounded-md bg-gray-50">
                      <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mr-3" />
                      <div>
                        <p className="font-medium text-sm sm:text-base">Código QR de Pago</p>
                        <p className="text-xs sm:text-sm text-gray-500">Compatible con todas las apps bancarias</p>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="pt-0 space-y-2">
                  {qrData ? (
                    <Button 
                      variant="outline" 
                      onClick={handleGenerateQr} 
                      disabled={isLoadingQr} 
                      className="w-full text-sm"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generar nuevo QR
                    </Button>
                  ) : (
                    <Button
                      onClick={handleGenerateQr}
                      disabled={isLoadingQr}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-sm"
                    >
                      {isLoadingQr ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generando QR...
                        </>
                      ) : (
                        "Generar código QR"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="shrink-0 flex justify-end pt-2 border-t">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-sm">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}