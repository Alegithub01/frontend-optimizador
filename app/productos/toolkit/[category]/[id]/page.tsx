"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, ChevronDown, Lock, Check, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { useCurrency } from "@/hooks/use-currency"
import VimeoPlayer from "@/components/VimeoPlayer"

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
  isFree?: boolean
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
  const { currency, formatPrice, isLoading: currencyLoading, error: currencyError } = useCurrency()

  const [product, setProduct] = useState<ToolkitProduct | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<ToolkitProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [activeSection, setActiveSection] = useState<number | null>(null)
  const [hasPurchased, setHasPurchased] = useState(false)

  const category = params.category
  const productId = params.id

  // Obtener el nombre para mostrar de la categoría
  const apiCategory = categoryMapping[category]
  const displayCategory = categoryDisplayNames[apiCategory] || category

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

      const finalPrice = product.isFree ? 0 : parsePrice(product.price)

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

  // Convertir precio a número para usar con el hook
  const productPriceUSD = Number.parseFloat(product.price)

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
            <VimeoPlayer videoUrl={product.trailerUrl} title={`Trailer de ${product.name}`} />
          ) : (
            <p className="text-gray-500">Este producto aún no tiene video de presentación.</p>
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
                    {currencyLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                    ) : currencyError ? (
                      <div className="text-red-500 text-sm mb-2">Error cargando precio: {currencyError}</div>
                    ) : (
                      <>
                        {product.isFree ? (
                          <div className="flex items-center mb-2">
                          
                          </div>
                        ) : (
                          <>
                            {/* Precio en moneda local - PRIMERO */}
                            <div className="flex items-center mb-2">
                              <span className="text-3xl font-bold">{formatPrice(productPriceUSD)}</span>
                              {currency.code !== "USD" && (
                                <div className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  🌍 {currency.code}
                                </div>
                              )}
                            </div>

                            {/* Precio en USD - SEGUNDO (solo si no es USD) */}
                            {currency.code !== "USD" && (
                              <div className="text-gray-600 text-sm mt-1">
                                <span>${productPriceUSD.toFixed(2)} USD</span>
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <Button
  className="w-full bg-orange-700 hover:bg-orange-600 text-black font-bold rounded-full mb-6 py-6 flex items-center justify-center"
  onClick={handleBuy}
  disabled={purchasing || currencyLoading}
>
  {purchasing ? (
    <>
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      Procesando...
    </>
  ) : currencyLoading ? (
    <>
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
      Cargando precio...
    </>
  ) : product.isFree ? (
    <>
      <span>Adquirir gratis</span>
      <CheckCircle className="ml-2 h-8 w-8" />
    </>
  ) : (
    <>
      <ShoppingCart className="mr-2 h-5 w-5" />
      <span>Comprar</span>
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
                const relatedPriceUSD = Number.parseFloat(relatedProduct.price)

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
                        {currencyLoading ? (
                          <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        ) : (
                          <>
                            {relatedProduct.isFree ? (
                              <div className="flex items-center">
                                <span className="text-2xl font-bold text-green-600">GRATIS</span>
                                <div className="ml-2 px-1 py-0.5 bg-green-100 text-green-800 text-xs rounded">🎉</div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center">
                                  <span className="text-2xl font-bold">{formatPrice(relatedPriceUSD)}</span>
                                </div>
                                {currency.code !== "USD" && (
                                  <div className="text-gray-500 text-xs mt-1">${relatedPriceUSD.toFixed(2)} USD</div>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>

                      <Button
                        className={`w-full ${getButtonColor(category)} text-white`}
                        onClick={() => router.push(`/productos/toolkit/${category}/${relatedProduct.id}`)}
                        disabled={currencyLoading}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {relatedProduct.isFree ? "Adquiérelo gratis" : "Comprar"}
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
