"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, CheckCircle, AlertCircle, RefreshCw, Copy, Check, Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { generateQrPayment, checkQrStatus, prepareQrData, type QrResponse } from "@/services/qr-payment-service"
import { useAuthContext } from "@/context/AuthContext"

interface QrPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  itemData: any
  onSuccess: () => void
}

export default function QrPaymentModal({ isOpen, onClose, itemData, onSuccess }: QrPaymentModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)
  const [qrData, setQrData] = useState<QrResponse | null>(null)
  const [qrStatus, setQrStatus] = useState<string>("pending")
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [copied, setCopied] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)

  // Generar QR al abrir el modal
  useEffect(() => {
    if (isOpen && user?.id && !qrData) {
      generateQr()
    }
  }, [isOpen, user?.id])

  // Contador de tiempo restante
  useEffect(() => {
    if (!qrData || qrStatus !== "pending") return

    const qrGeneratedTime = new Date(qrData.qr.fechaHora).getTime()
    const expirationTime = qrGeneratedTime + 15 * 60 * 1000

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const timeRemaining = Math.max(0, Math.floor((expirationTime - now) / 1000))
      setTimeLeft(timeRemaining)

      if (timeRemaining <= 0) {
        clearInterval(interval)
        toast({
          title: "QR expirado",
          description: "El código QR ha expirado. Por favor genera uno nuevo.",
          variant: "destructive",
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [qrData, qrStatus])

  const generateQr = async () => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para realizar un pago",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const userId = String(user.id)
      const qrRequestData = prepareQrData(itemData, userId)
      const response = await generateQrPayment(qrRequestData)
      setQrData(response)
      setQrStatus("pending")
    } catch (error: any) {
      console.error("Error al generar QR:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo generar el código QR",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async (numeroReferencia: string) => {
    setCheckingStatus(true)
    try {
      const status = await checkQrStatus(numeroReferencia)

      if (status.estado === "PAGADO") {
        setQrStatus("paid")
        toast({
          title: "¡Pago exitoso!",
          description: "Tu pago ha sido procesado correctamente",
        })
        setTimeout(() => {
          onSuccess()
          router.push("/checkout/success")
        }, 2000)
      } else if (status.estado === "EXPIRADO") {
        setQrStatus("expired")
      }
    } catch (error) {
      console.error("Error al verificar estado del QR:", error)
      toast({
        title: "Error",
        description: "No se pudo verificar el estado del pago",
        variant: "destructive",
      })
    } finally {
      setCheckingStatus(false)
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

  const handleManualCheck = async () => {
    if (!qrData) return
    await checkStatus(qrData.qr.numeroReferencia)
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pago con QR</DialogTitle>
          <DialogDescription>Escanea el código QR con tu aplicación bancaria para completar el pago</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-12 w-12 text-orange-500 animate-spin mb-4" />
              <p className="text-lg font-medium">Generando código QR...</p>
            </div>
          ) : qrStatus === "paid" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-700">¡Pago completado con éxito!</p>
              <p className="text-sm text-gray-500 mt-2">Redirigiendo a la página de confirmación...</p>
            </div>
          ) : qrStatus === "expired" ? (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
              <p className="text-lg font-medium text-amber-700">El código QR ha expirado</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">
                Por favor, genera un nuevo código QR para continuar con el pago
              </p>
              <Button onClick={generateQr} className="bg-orange-500 hover:bg-orange-600">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generar nuevo QR
              </Button>
            </div>
          ) : qrData ? (
            <Card className="w-full border-0 shadow-none">
              <CardContent className="flex flex-col items-center p-0">
                <div className="bg-white p-4 rounded-lg mb-4 border">
                  {qrData.qr.qrImage ? (
                    <Image
                      src={
                        qrData.qr.qrImage.startsWith("data:")
                          ? qrData.qr.qrImage
                          : `data:image/png;base64,${qrData.qr.qrImage}`
                      }
                      alt="Código QR de pago"
                      width={250}
                      height={250}
                      className="mx-auto"
                    />
                  ) : (
                    <div className="w-[250px] h-[250px] bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-500">QR no disponible</p>
                    </div>
                  )}
                </div>

                <div className="w-full text-center mb-4">
                  <p className="text-sm text-gray-500">
                    Tiempo restante: <span className="font-medium">{formatTimeLeft(timeLeft)}</span>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div
                      className="bg-orange-500 h-2.5 rounded-full"
                      style={{ width: `${(timeLeft / (15 * 60)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="w-full text-center mb-4">
                  <p className="text-xs text-gray-500">Referencia: {qrData.qr.numeroReferencia}</p>
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 flex items-center justify-center"
                    onClick={downloadQrImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar QR
                  </Button>
                  <Button variant="outline" className="flex-1 flex items-center justify-center" onClick={copyQrString}>
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    {copied ? "¡Copiado!" : "Copiar código"}
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-700 text-sm w-full">
                  <p className="font-medium mb-1">Instrucciones:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Abre la aplicación de tu banco</li>
                    <li>Selecciona la opción de pago por QR</li>
                    <li>Escanea el código QR mostrado</li>
                    <li>Confirma el monto y completa el pago</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-lg font-medium">No se pudo generar el código QR</p>
              <Button onClick={generateQr} className="mt-4 bg-orange-500 hover:bg-orange-600">
                <RefreshCw className="mr-2 h-4 w-4" />
                Intentar nuevamente
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-center sm:justify-between">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          {qrData && qrStatus === "pending" && (
            <Button 
              onClick={handleManualCheck} 
              variant="outline"
              disabled={checkingStatus}
            >
              {checkingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Verificar pago
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}