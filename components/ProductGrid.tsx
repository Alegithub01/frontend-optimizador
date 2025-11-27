"use client"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart, Package, Download, ArrowRight, CheckCircle } from "lucide-react"
import { useEffect, useState } from "react"

// Actualizar las interfaces para incluir las nuevas props
interface ProductGridProps {
  products: Product[]
  category: string
  isLoading: boolean
  purchasedProducts?: string[]
  purchasedProductsInfo?: PurchasedProductInfo[] // Nueva prop
  formatPrice?: (usdPrice: number) => string
  currency?: Currency
  currencyLoading?: boolean
  isAuthenticated?: boolean
  onProductAction?: (productId: string) => void // Función personalizada
  getProductPurchaseStatus?: (productId: string) => ProductPurchaseStatus // Nueva función
}

interface Product {
  id: string
  name: string
  author?: string
  price: string
  originalPrice?: string
  discount?: number
  image: string
  stock: number
  category: "libro" | "revista" | "toolkit"
  description?: string
  isFree?: boolean // Added isFree property
}

interface Currency {
  code: string
  symbol: string
  rate: number
  name: string
}

interface PurchasedProductInfo {
  id: string
  deliveryTypes: ("digital" | "physical")[]
  hasDigital: boolean
  hasPhysical: boolean
  hasBoth: boolean
}

interface ProductPurchaseStatus {
  isPurchased: boolean
  hasDigital: boolean
  hasPhysical: boolean
  hasBoth: boolean
}

interface CurrencyInfo {
  code: string
  symbol: string
  rate: number
  country: string
}

const COUNTRY_CURRENCIES: { [key: string]: CurrencyInfo } = {
  AR: { code: "ARS", symbol: "$", rate: 800, country: "Argentina" },
  CL: { code: "CLP", symbol: "$", rate: 850, country: "Chile" },
  CO: { code: "COP", symbol: "$", rate: 4000, country: "Colombia" },
  MX: { code: "MXN", symbol: "$", rate: 17, country: "México" },
  PE: { code: "PEN", symbol: "S/", rate: 3.6, country: "Perú" },
  EC: { code: "USD", symbol: "$", rate: 1, country: "Ecuador" },
  BO: { code: "BOB", symbol: "Bs.", rate: 6.96, country: "Bolivia" },
  PY: { code: "PYG", symbol: "Gs.", rate: 7200, country: "Paraguay" },
  UY: { code: "UYU", symbol: "$U", rate: 38, country: "Uruguay" },
  VE: { code: "VES", symbol: "Bs.S", rate: 35, country: "Venezuela" },
  ES: { code: "EUR", symbol: "€", rate: 0.92, country: "España" },
}

// Actualizar el componente para usar las nuevas props o fallback al sistema anterior
export default function ProductGrid({
  products,
  category,
  isLoading,
  purchasedProducts = [],
  purchasedProductsInfo = [],
  formatPrice,
  currency,
  currencyLoading = false,
  isAuthenticated = false,
  onProductAction,
  getProductPurchaseStatus,
}: ProductGridProps) {
  const router = useRouter()
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

  // Sistema de detección de moneda local (fallback si no se pasan las props)
  const [localCurrencyInfo, setLocalCurrencyInfo] = useState<CurrencyInfo>({
    code: "USD",
    symbol: "$",
    rate: 1,
    country: "Estados Unidos",
  })
  const [currencyDetectionError, setCurrencyDetectionError] = useState(false)

  // Usar las props pasadas o el sistema local
  const finalCurrency = currency || localCurrencyInfo
  const finalFormatPrice =
    formatPrice ||
    ((price: number) => {
      const localPrice = price * finalCurrency.rate
      if (finalCurrency.code === "BOB") {
        return localPrice.toFixed(2)
      } else if (["ARS", "CLP", "COP"].includes(finalCurrency.code)) {
        return Math.round(localPrice).toString()
      } else {
        return localPrice.toFixed(2)
      }
    })
  const finalCurrencyLoading = currencyLoading

  // Función para manejar la acción del producto (usar la personalizada o la por defecto)
  const handleProductAction = (productId: string) => {
    if (onProductAction) {
      onProductAction(productId)
    } else {
      // Lógica por defecto
      const isPurchased = isAuthenticated && purchasedProducts.includes(productId)
      if (isPurchased) {
        router.push(`/mis-compras/productos/${category}/${productId}`)
      } else {
        router.push(`/productos/${category}/${productId}`)
      }
    }
  }

  // Función para obtener el estado de compra (usar la personalizada o la por defecto)
  const getPurchaseStatus = (productId: string): ProductPurchaseStatus => {
    if (getProductPurchaseStatus) {
      return getProductPurchaseStatus(productId)
    } else {
      // Lógica por defecto
      const isPurchased = isAuthenticated && purchasedProducts.includes(productId)
      return {
        isPurchased,
        hasDigital: false,
        hasPhysical: false,
        hasBoth: false,
      }
    }
  }

  // Solo ejecutar detección local si no se pasaron las props de moneda
  useEffect(() => {
    if (!currency) {
      const detectCurrencyByIP = async () => {
        try {
          const ipRes = await fetch("https://ipapi.co/json/")
          if (!ipRes.ok) throw new Error("Error en la API de geolocalización")

          const ipData = await ipRes.json()
          const countryCode = ipData.country_code || "US"

          if (COUNTRY_CURRENCIES[countryCode]) {
            setLocalCurrencyInfo(COUNTRY_CURRENCIES[countryCode])
            return
          }

          const currencyCode = ipData.currency || "USD"

          if (currencyCode === "USD") {
            setLocalCurrencyInfo({
              code: "USD",
              symbol: "$",
              rate: 1,
              country: ipData.country_name || "Estados Unidos",
            })
            return
          }

          try {
            const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
            const rateData = await rateRes.json()
            const rate = rateData.rates[currencyCode] || 1

            setLocalCurrencyInfo({
              code: currencyCode,
              symbol: currencyCode === "EUR" ? "€" : "$",
              rate: rate,
              country: ipData.country_name || "Desconocido",
            })
          } catch {
            setLocalCurrencyInfo({
              code: currencyCode,
              symbol: "$",
              rate: 1,
              country: ipData.country_name || "Desconocido",
            })
          }
        } catch (error) {
          console.error("Error detectando moneda:", error)
          setCurrencyDetectionError(true)
          setLocalCurrencyInfo({
            code: "USD",
            symbol: "$",
            rate: 1,
            country: "Estados Unidos",
          })
        }
      }

      detectCurrencyByIP()
    }
  }, [currency])

  const parsePrice = (priceString: string): number => {
    try {
      const cleanedPrice = priceString.replace(/[^\d.]/g, "")
      return Number.parseFloat(cleanedPrice)
    } catch (error) {
      console.error("Error parsing price:", error)
      return 0
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto py-16 px-4">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-lg font-medium text-orange-500 capitalize">Todos los</h2>
            <h1 className="text-5xl md:text-6xl font-black uppercase">{category}s</h1>
            {!finalCurrencyLoading && finalCurrency.code !== "USD" && (
              <p className="text-sm text-gray-500 mt-2">
                Precios mostrados en {finalCurrency.code} • Tasa de cambio actualizada
              </p>
            )}
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <div className="animate-pulse">
                  <div className="bg-gray-200 h-60 w-full rounded-lg mb-4"></div>
                  <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
                  <div className="bg-gray-200 h-4 w-1/2 rounded mb-4"></div>
                  <div className="bg-gray-200 h-8 w-full rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500 capitalize">Todos los</h2>
          <h1 className="text-5xl md:text-6xl font-black uppercase">{category}s</h1>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product) => {
              const purchaseStatus = getPurchaseStatus(product.id)
              const priceUSD = parsePrice(product.price)
              const localPrice = finalFormatPrice(priceUSD)
              const originalPriceLocal = product.originalPrice
                ? finalFormatPrice(parsePrice(product.originalPrice))
                : null

              return (
                <div
                  key={product.id}
                  className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                  onMouseEnter={() => setHoveredProduct(product.id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                >
                  {/* Imagen con indicadores de compra */}
                  <div className="relative h-80 w-full">
                    <Image
                      src={product.image || "/placeholder.svg?height=320&width=240&query=book"}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                    />

                    {/* Indicadores de versiones compradas */}
                    {purchaseStatus.isPurchased && (
                      <div className="absolute top-2 right-2 space-y-1">
                        {purchaseStatus.hasBoth ? (
                          <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            ✓ ADQUIRIDO EN AMBOS FORMATOS
                          </div>
                        ) : (
                          <>
                            {purchaseStatus.hasDigital && (
                              <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Download className="w-3 h-3" />
                                DIGITAL
                              </div>
                            )}
                            {purchaseStatus.hasPhysical && (
                              <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                FÍSICO
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {hoveredProduct === product.id && (
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <Button
                          className={`rounded-full text-white ${
                            purchaseStatus.hasBoth
                              ? "bg-gray-500 hover:bg-gray-600"
                              : "bg-orange-700 hover:bg-orange-600"
                          }`}
                          onClick={() => handleProductAction(product.id)}
                        >
                          {purchaseStatus.hasBoth ? (
                            <>
                              Leer <Eye className="ml-2 h-4 w-4" />
                            </>
                          ) : purchaseStatus.isPurchased ? (
                            <>
                              Ver más <ShoppingCart className="ml-2 h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Ver más <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex flex-col flex-grow">
                    <h2 className="text-xl font-bold line-clamp-2">{product.name}</h2>
                    {product.author && <p className="text-black font-light text-sm mt-1">Por {product.author}</p>}

    

                    {/* Avisos según el estado de compra */}
                    {purchaseStatus.isPurchased && (
                      <div className="mt-2 mb-2 space-y-2">
                        {purchaseStatus.hasBoth ? (
                          <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-green-800 text-xs font-medium">
                              ¡Tienes ambas versiones! Accede a tus compras.
                            </p>
                          </div>
                        ) : (
                          <>
                            {purchaseStatus.hasDigital && (
                              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-blue-800 text-xs font-medium">✓ Tienes la versión digital</p>
                                <p className="text-blue-600 text-xs">Aún puedes comprar la versión física</p>
                              </div>
                            )}
                            {purchaseStatus.hasPhysical && (
                              <div className="p-2 bg-orange-50 border border-orange-200 rounded-lg">
                                <p className="text-orange-800 text-xs font-medium">✓ Tienes la versión física</p>
                                <p className="text-orange-600 text-xs">Aún puedes comprar la versión digital</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <div className="mt-auto pt-4">
                      {!purchaseStatus.hasBoth && (
                        <>
                          <div className="flex items-center">
                            <span className="text-black font-bold text-lg">
                              {finalCurrencyLoading ? (
                                <span className="animate-pulse bg-gray-200 rounded px-2 py-1">...</span>
                              ) : (
                                `${finalCurrency.symbol} ${localPrice}`
                              )}
                              <span className="text-xs ml-1">{finalCurrency.code}</span>
                            </span>
                            {product.discount && originalPriceLocal && (
                              <span className="ml-2 text-gray-500 line-through text-sm">
                                {finalCurrency.symbol} {originalPriceLocal}
                              </span>
                            )}
                          </div>
                          {product.discount && <p className="text-red-500 text-sm">{product.discount}% Dto</p>}
                          <p className="text-gray-600 font-light text-sm mb-4">USD ${priceUSD.toFixed(2)}</p>
                        </>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className={`rounded-full w-full text-white hover:text-white ${
                            purchaseStatus.hasBoth
                              ? "bg-gray-500 hover:bg-gray-600"
                              : product.isFree
                              ? "bg-green-800 hover:bg-green-500 text-green-lima"
                              : "bg-orange-700 hover:bg-orange-600"
                          }`}
                          onClick={() => handleProductAction(product.id)}
                          disabled={finalCurrencyLoading}
                        >
                          {product.isFree ? (
                            <span className="flex items-center gap-2">
                              Gratís
                              <CheckCircle className="h-4 w-4" />
                            </span>
                          ) : purchaseStatus.hasBoth ? (
                            "Leer"
                          ) : purchaseStatus.isPurchased ? (
                            "Ver más"
                          ) : (
                            "Ver más"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-bold mb-4">No hay {category}s disponibles</h3>
            <p className="text-gray-600">Pronto tendremos más contenido disponible.</p>
          </div>
        )}

        {/* Mensaje para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="mt-12 max-w-2xl mx-auto text-center p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-xl font-bold text-blue-900 mb-2">¿Ya tienes una cuenta?</h3>
            <p className="text-blue-700 mb-4">
              Inicia sesión para ver tus {category}s comprados y acceder a tu biblioteca personal.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2"
            >
              Iniciar Sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
