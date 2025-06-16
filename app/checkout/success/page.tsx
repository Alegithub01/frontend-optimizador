"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const [itemType, setItemType] = useState<string>("")
  const [itemName, setItemName] = useState<string>("")

  useEffect(() => {
    // Determine what type of item was purchased
    const checkoutProduct = localStorage.getItem("checkoutProduct")
    const checkoutCourse = localStorage.getItem("checkoutCourse")
    const checkoutEvent = localStorage.getItem("checkoutEvent")

    if (checkoutProduct) {
      const product = JSON.parse(checkoutProduct)
      setItemType("producto")
      setItemName(product.name || "")
    } else if (checkoutCourse) {
      const course = JSON.parse(checkoutCourse)
      setItemType("curso")
      setItemName(course.name || "")
    } else if (checkoutEvent) {
      const event = JSON.parse(checkoutEvent)
      setItemType("evento")
      setItemName(event.name || "")
    }

    // Clear checkout data from localStorage
    // We keep the data for this session in case user refreshes the page
    // but will clear it when they navigate away
    const clearCheckoutData = () => {
      localStorage.removeItem("checkoutProduct")
      localStorage.removeItem("checkoutCourse")
      localStorage.removeItem("checkoutEvent")
    }

    // Add event listener to clear data when user navigates away
    window.addEventListener("beforeunload", clearCheckoutData)

    // Return cleanup function
    return () => {
      window.removeEventListener("beforeunload", clearCheckoutData)
    }
  }, [])

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
              <p className="text-blue-700 text-sm">
                <strong>Información importante:</strong>
              </p>
              <ul className="text-blue-700 text-sm list-disc pl-5 mt-2 space-y-1">
                <li>Hemos enviado un correo electrónico con los detalles de tu compra.</li>
                {itemType === "producto" && (
                  <li>
                    Si compraste un producto físico, nuestro equipo se pondrá en contacto contigo para coordinar la
                    entrega.
                  </li>
                )}
                {itemType === "curso" && <li>Ya puedes acceder a tu curso desde tu panel de usuario.</li>}
                {itemType === "evento" && <li>Recibirás información adicional sobre el evento en tu correo.</li>}
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={() => router.push("/dashboard")} className="w-full bg-orange-500 hover:bg-orange-600">
            Ir a mi cuenta
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
