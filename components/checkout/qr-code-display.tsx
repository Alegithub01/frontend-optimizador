"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"

interface QrCodeDisplayProps {
  qrUrl: string
  qrImage?: string
  paymentId: string
  amount: number
  currency?: string
  expiresAt?: string
  onRefresh?: () => void
}

export default function QrCodeDisplay({
  qrUrl,
  qrImage,
  paymentId,
  amount,
  currency = "BOB",
  expiresAt,
  onRefresh,
}: QrCodeDisplayProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(
    expiresAt ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - new Date().getTime()) / 1000)) : 0,
  )

  const copyQrString = () => {
    navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    toast({
      title: "Copiado",
      description: "Código QR copiado al portapapeles",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQrImage = () => {
    if (!qrImage) return

    const link = document.createElement("a")
    link.href = qrImage
    link.download = `qr-pago-${paymentId}.png`
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

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-4 rounded-lg mb-4 border">
        {qrImage ? (
          <Image
            src={qrImage.startsWith("data:") ? qrImage : `data:image/png;base64,${qrImage}`}
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

      <div className="text-center mb-4">
        <p className="text-lg font-bold">
          {amount.toFixed(2)} {currency}
        </p>
        <p className="text-xs text-gray-500">Referencia: {paymentId}</p>
      </div>

      {expiresAt && (
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
      )}

      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          className="flex-1 flex items-center justify-center"
          onClick={downloadQrImage}
          disabled={!qrImage}
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

      {onRefresh && (
        <Button variant="ghost" className="mt-4" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Generar nuevo código
        </Button>
      )}
    </div>
  )
}