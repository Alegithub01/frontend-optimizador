"use client"

import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CheckoutCancelPage() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-12 px-4 max-w-md">
      <Card className="border-amber-100 shadow-lg">
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-amber-100 p-3">
              <AlertCircle className="h-12 w-12 text-amber-600" />
            </div>
          </div>
          <CardTitle className="text-center text-2xl text-amber-700">Pago Cancelado</CardTitle>
          <CardDescription className="text-center text-amber-600">Tu proceso de pago ha sido cancelado</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <p className="text-center">No te preocupes, no se ha realizado ningún cargo a tu tarjeta.</p>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-blue-700 text-sm">
                <strong>¿Tuviste algún problema?</strong>
              </p>
              <p className="text-blue-700 text-sm mt-2">
                Si encontraste alguna dificultad durante el proceso de pago, no dudes en contactar a nuestro equipo de
                soporte.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={() => router.push("/checkout")} className="w-full bg-orange-500 hover:bg-orange-600">
            Intentar nuevamente
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            Volver al inicio
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
