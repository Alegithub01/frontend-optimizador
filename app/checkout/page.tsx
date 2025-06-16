"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import CheckoutForm from "@/components/checkout/checkout-form"
import ProductSummary from "@/components/checkout/product-summary"
import { useAuthContext } from "@/context/AuthContext"
import { api } from "@/lib/api"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId")
  const productId = searchParams.get("productId")
  const { isAuthenticated, isLoading } = useAuthContext()
  const [country, setCountry] = useState<string | null>(null)
  const [isLoadingCountry, setIsLoadingCountry] = useState(true)
  const [isLoadingItem, setIsLoadingItem] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)

  // Detectar país
  useEffect(() => {
    const detectCountry = async () => {
      try {
        const browserLocale = navigator.language || navigator.languages?.[0]
        if (browserLocale?.includes("es-BO") || browserLocale?.includes("es_BO")) {
          setCountry("Bolivia")
          setIsLoadingCountry(false)
          return
        }

        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (timezone === "America/La_Paz") {
          setCountry("Bolivia")
          setIsLoadingCountry(false)
          return
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 3000)

        try {
          const response = await fetch("https://ipapi.co/json/", {
            signal: controller.signal,
            headers: { Accept: "application/json" },
          })
          clearTimeout(timeoutId)

          if (response.ok) {
            const data = await response.json()
            setCountry(data.country_name || "Bolivia")
          } else {
            throw new Error("API response not ok")
          }
        } catch (fetchError) {
          console.warn("Could not detect country, defaulting to Bolivia:", fetchError)
          setCountry("Bolivia")
        }
      } catch (error) {
        console.warn("Error in country detection:", error)
        setCountry("Bolivia")
      } finally {
        setIsLoadingCountry(false)
      }
    }

    detectCountry()
  }, [])

  // Cargar datos del curso o producto
  useEffect(() => {
    const fetchItemData = async () => {
      const courseInStorage = localStorage.getItem("checkoutCourse")
      const productInStorage = localStorage.getItem("checkoutProduct")

      if (courseInStorage || productInStorage) {
        console.log("Datos encontrados en localStorage")
        return
      }

      const idToFetch =
        courseId ||
        productId ||
        localStorage.getItem("pendingPurchaseCourseId") ||
        localStorage.getItem("pendingPurchaseProductId")

      if (!idToFetch) return

      try {
        setIsLoadingItem(true)

        if (courseId || localStorage.getItem("pendingPurchaseCourseId")) {
          const courseRes = await api.get(`/courses/${idToFetch}`)
          localStorage.setItem(
            "checkoutCourse",
            JSON.stringify({
              id: courseRes.id,
              title: courseRes.title,
              price: courseRes.price,
              discount: courseRes.discount,
              image: courseRes.image,
              type: "course",
            }),
          )
          localStorage.removeItem("pendingPurchaseCourseId")
        } else {
          const productRes = await api.get(`/products/${idToFetch}`)
          localStorage.setItem(
            "checkoutProduct",
            JSON.stringify({
              id: productRes.id,
              title: productRes.title,
              price: productRes.price,
              discount: productRes.discount,
              image: productRes.image,
              type: "product",
            }),
          )
          localStorage.removeItem("pendingPurchaseProductId")
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setIsLoadingItem(false)
      }
    }

    fetchItemData()
  }, [searchParams])

  // Redirección si no está autenticado
  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated && !hasRedirected) {
      setHasRedirected(true)

      if (courseId) localStorage.setItem("pendingPurchaseCourseId", courseId)
      if (productId) localStorage.setItem("pendingPurchaseProductId", productId)

      const redirectParams = courseId
        ? `?courseId=${courseId}`
        : productId
        ? `?productId=${productId}`
        : ""

      const redirectUrl = `/login?redirect=/checkout${redirectParams}`
      router.replace(redirectUrl)
    }
  }, [isAuthenticated, isLoading, router, courseId, productId, hasRedirected])

  if (isLoading || isLoadingItem || isLoadingCountry) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Finalizar compra</h1>
        <p className="text-muted-foreground mb-8">Completa tu información para procesar el pago de forma segura</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CheckoutForm
              country={country}
              courseId={courseId ? Number(courseId) : undefined}
              productId={searchParams.get("productId") || undefined}
            />
          </div>

          <div className="lg:col-span-1">
            <ProductSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
