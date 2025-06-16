"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, ChevronDown, Lock, Check } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"

// Interfaces que coinciden con la estructura de tu backend
interface ToolkitSection {
  id: number
  title: string
  videoUrl: string | null
  description: string
  fileUrl: string | null
  createdAt: string
}

interface ToolkitProduct {
  id: string
  name: string
  author: string
  price: string
  stock: number
  image: string
  category: string
  subCategory: string
  description: string
  pdfUrl: string | null
  sections: ToolkitSection[]
  createdAt: string
  updatedAt: string
  trailerUrl: string | null
}

interface CountryInfo {
  country: string
  countryCode: string
  currency: string
  currencySymbol: string
  exchangeRate: number
}

interface ToolkitProductPageProps {
  params: {
    category: string
    id: string
  }
}

// Mapeo de categorías URL a enums del backend
const categoryMapping: Record<string, string> = {
  energia: "ENERGY",
  alimentacion: "NUTRITION",
  meditacion: "MEDITATION",
  negocio: "BUSINESS",
}

// Mapeo de enums del backend a nombres para mostrar
const categoryDisplayNames: Record<string, string> = {
  ENERGY: "Energía",
  NUTRITION: "Alimentación",
  MEDITATION: "Meditación",
  BUSINESS: "Negocio",
}

export default function ToolkitProductPage({ params }: ToolkitProductPageProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthContext()
  const [product, setProduct] = useState<ToolkitProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ToolkitProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [activeSection, setActiveSection] = useState<number | null>(null)
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null)
  const [hasPurchased, setHasPurchased] = useState(false)

  const category = params.category
  const productId = params.id

  // Obtener el nombre para mostrar de la categoría
  const apiCategory = categoryMapping[category]
  const displayCategory = categoryDisplayNames[apiCategory] || category

  // Función para convertir precio a moneda local
  const convertToLocalCurrency = (priceUSD: string | number) => {
    const price = typeof priceUSD === "string" ? Number.parseFloat(priceUSD) : priceUSD

    if (!countryInfo) return null

    // Para Bolivia, usamos un tipo de cambio fijo de 6.96
    const exchangeRate = countryInfo.countryCode === "BO" ? 6.96 : countryInfo.exchangeRate

    return {
      price: price * exchangeRate,
      currency: countryInfo.currency,
      symbol: countryInfo.currencySymbol,
      country: countryInfo.country,
      exchangeRate: exchangeRate,
    }
  }

  // Función para obtener el color según la categoría
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "energia":
      case "energy":
        return "text-orange-500"
      case "alimentacion":
      case "nutrition":
        return "text-orange-600"
      case "meditacion":
      case "meditation":
        return "text-orange-500"
      case "negocio":
      case "business":
        return "text-orange-500"
      default:
        return "text-orange-500"
    }
  }

  // Función para obtener el color del botón según la categoría
  const getButtonColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "energia":
      case "energy":
        return "bg-orange-500 hover:bg-orange-600"
      case "alimentacion":
      case "nutrition":
        return "bg-orange-600 hover:bg-orange-700"
      case "meditacion":
      case "meditation":
        return "bg-orange-500 hover:bg-orange-600"
      case "negocio":
      case "business":
        return "bg-orange-500 hover:bg-orange-600"
      default:
        return "bg-orange-500 hover:bg-orange-600"
    }
  }

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // Primero, intentamos detectar desde el navegador
        const browserLocale = navigator.language || navigator.languages?.[0]
        if (browserLocale?.includes("es-BO") || browserLocale?.includes("es_BO")) {
          setCountryInfo({
            country: "Bolivia",
            countryCode: "BO",
            currency: "BOB",
            currencySymbol: "Bs",
            exchangeRate: 6.96,
          })
          return
        }

        // Intentar detectar desde timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (timezone === "America/La_Paz") {
          setCountryInfo({
            country: "Bolivia",
            countryCode: "BO",
            currency: "BOB",
            currencySymbol: "Bs",
            exchangeRate: 6.96,
          })
          return
        }

        // Fallback a Bolivia
        setCountryInfo({
          country: "Bolivia",
          countryCode: "BO",
          currency: "BOB",
          currencySymbol: "Bs",
          exchangeRate: 6.96,
        })
      } catch (error) {
        console.error("Error detecting country:", error)
        // Fallback a Bolivia
        setCountryInfo({
          country: "Bolivia",
          countryCode: "BO",
          currency: "BOB",
          currencySymbol: "Bs",
          exchangeRate: 6.96,
        })
      }
    }

    detectCountry()
  }, [])

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setLoading(true)

        // Obtener producto específico por ID
        const productData = await api.get<ToolkitProduct>(`/product/${productId}`)
        setProduct(productData)

        // Obtener productos relacionados de la misma categoría
        if (apiCategory) {
          const allProducts = await api.get<ToolkitProduct[]>(`/product/category/toolkit/${apiCategory}`)
          // Filtrar el producto actual y limitar a 3 productos
          const filtered = allProducts.filter((p) => p.id !== productId).slice(0, 3)
          setRelatedProducts(filtered)
        }

        // Verificar si el usuario ha comprado el producto
        if (isAuthenticated && user) {
          try {
            setHasPurchased(false)
          } catch (error) {
            console.error("Error verifying user purchases:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching product data:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el producto.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [productId, apiCategory, isAuthenticated, user])

  const toggleSection = (sectionId: number) => {
    if (activeSection === sectionId) {
      setActiveSection(null)
    } else {
      setActiveSection(sectionId)
    }
  }

  const handleBuy = async () => {
    if (!product) return

    setPurchasing(true)

    try {
      // Función para convertir precio a número si es string
      const parsePrice = (price: string | number): number => {
        if (typeof price === "string") {
          return Number.parseFloat(price)
        }
        return price
      }

      const finalPrice = parsePrice(product.price)

      if (!isAuthenticated) {
        // Si no está autenticado, guardar el producto actual y redirigir a login
        localStorage.setItem("pendingPurchaseProductId", productId)
        const redirectUrl = `/checkout?toolkitId=${productId}`
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
        return
      }

      // Limpiar localStorage de datos anteriores
      localStorage.removeItem("checkoutCourse")
      localStorage.removeItem("checkoutProduct")
      localStorage.removeItem("checkoutEvent")

      // Preparar datos del toolkit para el componente de checkout
      const toolkitData = {
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: product.image,
        category: product.category,
        subCategory: product.subCategory,
        format: "digital", // Los toolkits son siempre digitales
        deliveryType: "digital", // Formato en inglés para el backend
        type: "product", // Cambiado de "toolkit" a "product"
        // Añadir estos campos para asegurar que estén disponibles para el backend
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "", // Se llenará en el checkout
        country: "Bolivia", // Por defecto
      }

      // Guardar en localStorage para que el componente de checkout pueda acceder
      localStorage.setItem("checkoutProduct", JSON.stringify(toolkitData))

      // Redirigir al checkout como en los cursos
      router.push("/checkout")
    } catch (error) {
      console.error("Error preparing checkout:", error)
      toast({
        title: "Error",
        description: "Ocurrió un problema al preparar la compra.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando toolkit...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl">Toolkit no encontrado</p>
      </div>
    )
  }

  // Convertir a moneda local
  const localPrice = convertToLocalCurrency(product.price)

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href={`/productos/toolkit/${category}`}
            className="text-orange-500 hover:text-orange-600 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a {displayCategory}
          </Link>
        </div>

        {/* Video Trailer del Producto */}
        <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
          {product.trailerUrl ? (
            <iframe
              src={
                product.trailerUrl.includes("vimeo.com")
                  ? `https://player.vimeo.com/video/${product.trailerUrl.split("/").pop()}?autoplay=1&loop=0&muted=1&title=0&byline=0&portrait=0&controls=0`
                  : product.trailerUrl
              }
              className="w-full h-full rounded-lg"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={`Trailer de ${product.name}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200">
              <div className="text-center text-orange-600">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-lg font-medium">Video próximamente</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Info - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className={`${getCategoryColor(category)} font-medium mb-2`}>
                TOOLKIT {displayCategory.toUpperCase()}
              </div>
              <h1 className="text-4xl font-black mb-6">{product.name}</h1>

              {product.author && <p className="text-lg text-gray-600 mb-4">Por {product.author}</p>}

              <p className="text-lg mb-8">{product.description}</p>

              {/* Contenido del Toolkit */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Contenido del toolkit</h2>
                <div className="space-y-3">
                  {product.sections
                    .sort((a, b) => a.id - b.id)
                    .map((section) => (
                      <div
                        key={section.id}
                        className="bg-gray-100 rounded-lg p-4 cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{section.title}</div>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              activeSection === section.id ? "transform rotate-180" : ""
                            }`}
                          />
                        </div>
                        {activeSection === section.id && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-gray-600 mb-3">{section.description}</p>
                            <div className="flex items-center space-x-4">
                              {section.videoUrl && (
                                <div className="flex items-center text-orange-500">
                                  {hasPurchased ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Lock className="h-4 w-4 mr-2" />
                                  )}
                                  <span className="text-sm">📹 Video incluido</span>
                                </div>
                              )}
                              {section.fileUrl && (
                                <div className="flex items-center text-orange-500">
                                  {hasPurchased ? (
                                    <Check className="h-4 w-4 mr-2" />
                                  ) : (
                                    <Lock className="h-4 w-4 mr-2" />
                                  )}
                                  <span className="text-sm">📄 Archivo descargable</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-md text-green-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Ya tienes acceso a este toolkit</span>
                  </div>
                  <Button className={`w-full ${getButtonColor(category)}`}>Descargar toolkit</Button>
                </div>
              ) : (
                <>
                  {/* Precio */}
                  <div className="mb-6">
                    {/* Precio en moneda local - PRIMERO */}
                    {localPrice && (
                      <div className="flex items-center mb-2">
                        <span className="text-3xl font-bold">
                          {localPrice.symbol}
                          {localPrice.price.toFixed(2)}
                        </span>
                        <span className="ml-2 text-gray-500">{localPrice.currency}</span>
                      </div>
                    )}

                    {/* Precio en USD - SEGUNDO */}
                    <div className="text-gray-600 text-sm mt-1">
                      <span>${Number.parseFloat(product.price).toFixed(2)} USD</span>
                    </div>
                  </div>

                  {/* Badge de producto digital */}
                  <div className="mb-6">
                    <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      📱 Producto Digital - Descarga Inmediata
                    </span>
                  </div>

                  <Button
                    className={`w-full ${getButtonColor(category)} text-white mb-6 py-6`}
                    onClick={handleBuy}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Comprar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Productos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Más toolkits de {displayCategory}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedProducts.map((relatedProduct) => {
                const relatedLocalPrice = convertToLocalCurrency(relatedProduct.price)

                return (
                  <div key={relatedProduct.id} className="bg-white rounded-lg overflow-hidden shadow">
                    <div className="relative h-48 w-full">
                      <Image
                        src={relatedProduct.image || "/placeholder.svg?height=200&width=300"}
                        alt={relatedProduct.name}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <div className="p-4">
                      <div className={`${getCategoryColor(category)} text-sm font-medium mb-1`}>
                        Toolkit {displayCategory}
                      </div>
                      <h3 className="font-bold mb-2">{relatedProduct.name}</h3>
                      <p className="text-gray-600 text-sm mb-4">{relatedProduct.description}</p>

                      {/* Precio */}
                      <div className="mb-4">
                        {relatedLocalPrice && (
                          <div className="flex items-center">
                            <span className="text-2xl font-bold">
                              {relatedLocalPrice.symbol}
                              {relatedLocalPrice.price.toFixed(2)}
                            </span>
                            <span className="ml-1 text-sm text-gray-500">{relatedLocalPrice.currency}</span>
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-1">
                          ${Number.parseFloat(relatedProduct.price).toFixed(2)} USD
                        </div>
                      </div>

                      <Button
                        className={`w-full ${getButtonColor(category)} text-white`}
                        onClick={() => router.push(`/productos/toolkit/${category}/${relatedProduct.id}`)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Comprar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
