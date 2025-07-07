"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [itemType, setItemType] = useState<"curso" | "producto" | "evento" | "">()
  const [itemName, setItemName] = useState<string>("")
  const [deliveryType, setDeliveryType] = useState<"digital" | "physical" | null>(null)

  useEffect(() => {
    const checkoutProduct = localStorage.getItem("checkoutProduct")
    const checkoutCourse = localStorage.getItem("checkoutCourse")
    const checkoutEvent = localStorage.getItem("checkoutEvent")

    if (checkoutProduct) {
      const product = JSON.parse(checkoutProduct)
      setItemType("producto")
      setItemName(product.name || "")
      setDeliveryType(product.deliveryType || "digital") // ← importante
    } else if (checkoutCourse) {
      const course = JSON.parse(checkoutCourse)
      setItemType("curso")
      setItemName(course.name || "")
    } else if (checkoutEvent) {
      const event = JSON.parse(checkoutEvent)
      setItemType("evento")
      setItemName(event.name || "")
    }

    const clearCheckoutData = () => {
      localStorage.removeItem("checkoutProduct")
      localStorage.removeItem("checkoutCourse")
      localStorage.removeItem("checkoutEvent")
    }

    window.addEventListener("beforeunload", clearCheckoutData)
    return () => window.removeEventListener("beforeunload", clearCheckoutData)
  }, [])

  const renderInfoMessage = () => {
    if (itemType === "producto") {
      return (
        <>
          <li>
            Puedes revisar tu compra desde{" "}
            <a href="/mis-compras" className="text-blue-600 underline">
              Mis Compras
            </a>.
          </li>
          {deliveryType === "physical" && (
            <li>
              Si es un producto físico, nuestro equipo te contactará para coordinar el envío. También puedes escribirnos por{" "}
              <a
                href="https://wa.me/59177419374"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                WhatsApp
              </a>.
            </li>
          )}
        </>
      )
    }

    if (itemType === "curso") {
      return (
        <li>
          Ya puedes acceder a tu curso desde{" "}
          <a href="/mi-aprendizaje" className="text-blue-600 underline">
            tu panel de aprendizaje
          </a>.
        </li>
      )
    }

    if (itemType === "evento") {
      return (
        <li>
          El día del evento deberás presentar tu comprobante de pago. Si pagaste con tarjeta, lleva también una copia del recibo.
        </li>
      )
    }

    return <li>Gracias por tu compra.</li>
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="border-green-100 shadow-lg">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl text-green-700">¡Pago Exitoso!</CardTitle>
          <CardDescription className="text-center text-green-600">
            Tu compra ha sido procesada correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-center">
              {itemName ? (
                <>
                  Gracias por tu compra de <span className="font-medium">{itemName}</span>
                </>
              ) : (
                "Gracias por tu compra"
              )}
            </p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-blue-700 text-sm font-semibold mb-2">
                Información importante:
              </p>
              <ul className="text-blue-700 text-sm list-disc pl-5 space-y-1">
                <li>Hemos enviado un correo electrónico con los detalles de tu compra.</li>
                {renderInfoMessage()}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {/*<Button onClick={() => router.push("/dashboard")} className="w-full bg-orange-500 hover:bg-orange-600">
            Ir a mi cuenta
          </Button>*/}
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
