"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { useCurrency } from "@/hooks/use-currency"
import { ShoppingCart } from "lucide-react"

interface EKidsProduct {
  id: string
  name: string
  author?: string
  price: string
  image: string
  category: string
  subCategory: string
  description?: string
  createdAt: string
  updatedAt: string
  isFree?: boolean // Added isFree property
}

interface PurchasedProduct {
  id: number
  product: {
    id: string
    name: string
    category: string
  }
  status: string
  deliveryType: "digital" | "physical"
}

// Mapeo de categorías URL a enums del backend
const categoryMapping: Record<string, string> = {
  energia: "ENERGY",
  alimentacion: "NUTRITION",
  meditacion: "MEDITATION",
  negocio: "BUSINESS",
  negocios: "BUSINESS", // ✅ AGREGADO
}

// Mapeo de enums del backend a nombres para mostrar
const categoryDisplayNames: Record<string, string> = {
  ENERGY: "Energía",
  NUTRITION: "Alimentación",
  MEDITATION: "Meditación",
  BUSINESS: "Negocio",
}

export default function EKidsCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuthContext()
  const { formatPrice, currency, isLoading: currencyLoading } = useCurrency()
  const [products, setProducts] = useState<EKidsProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([])

  // Obtener la categoría de la URL
  const category = params.category as string

  // Convertir la categoría de la URL a la categoría que espera la API
  const apiCategory = categoryMapping[category]

  // Si no encuentra el mapeo, mostrar error claro
  if (!apiCategory) {
    console.error(`❌ Categoría no encontrada en mapping: "${category}"`)
    console.error("Categorías disponibles:", Object.keys(categoryMapping))
  }

  // Usar el mapeo o mostrar error
  const finalApiCategory = apiCategory || "BUSINESS" // fallback por defecto

  // Nombre para mostrar de la categoría
  const displayCategory = categoryDisplayNames[finalApiCategory] || category

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log(`🔍 URL Category from params: "${category}"`)
        console.log(`🔄 Mapped API Category: "${finalApiCategory}"`)
        console.log(`📡 Final API URL: /product/category/e-kit/${finalApiCategory}`)

        // Validar que tenemos una categoría válida
        if (!finalApiCategory || !["ENERGY", "NUTRITION", "MEDITATION", "BUSINESS"].includes(finalApiCategory)) {
          throw new Error(`Categoría inválida: ${category} -> ${finalApiCategory}`)
        }

        // Llamar a la API para obtener los productos de la subcategoría
        const data = await api.get<EKidsProduct[]>(`/product/category/e-kit/${finalApiCategory}`)
        console.log("✅ Products received:", data)
        setProducts(data)

        if (data.length === 0) {
          setError("No hay productos disponibles en esta categoría.")
        }

        // Obtener productos comprados por el usuario si está autenticado
        if (isAuthenticated && user?.id) {
          try {
            console.log(`🔍 Haciendo fetch a: /sales/user/${user.id}/products`)
            const purchasedData = await api.get<PurchasedProduct[]>(`/sales/user/${user.id}/products`)
            console.log("🛒 Respuesta de productos comprados:", purchasedData)

            // Solo considerar productos con status "paid" y que sean e-kids
            const paidEKids = purchasedData.filter(
              (purchase) => purchase.status === "paid" && purchase.product.category === "e-kit",
            )
            const purchasedProductIds = paidEKids.map((purchase) => purchase.product.id)
            console.log("🛒 IDs de e-kit comprados:", purchasedProductIds)
            setPurchasedProducts(purchasedProductIds)
          } catch (error) {
            console.error("❌ Error fetching purchased products:", error)
            setPurchasedProducts([])
          }
        } else {
          setPurchasedProducts([])
        }
      } catch (error) {
        console.error("❌ Error fetching e-kit products:", error)
        setError("Error al cargar los productos. Verifica tu conexión e intenta de nuevo.")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchData()
    }
  }, [category, finalApiCategory, isAuthenticated, user])

  const handleProductAction = (productId: string) => {
    const isPurchased = isAuthenticated && purchasedProducts.includes(productId)
    if (isPurchased) {
      // Si ya compró el producto, ir a mis-productos
      router.push(`/mis-compras/productos/e-kit/${productId}`)
    } else {
      // Si no lo compró, ir a la página de detalle del producto
      router.push(`/productos/e-kit/${category}/${productId}`)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "energia":
      case "energy":
        return "text-pink-500" // ENERGÍA = ROSA
      case "alimentacion":
      case "nutrition":
        return "text-green-500" // ALIMENTACIÓN = VERDE
      case "meditacion":
      case "meditation":
        return "text-purple-500" // MEDITACIÓN = MORADO
      case "negocio":
      case "negocios":
      case "business":
        return "text-blue-500" // NEGOCIO = AZUL
      default:
        return "text-gray-500"
    }
  }

  const getButtonColor = (category: string, isPurchased = false) => {
    if (isPurchased) {
      return "bg-gray-500 hover:bg-gray-600"
    }
    switch (category.toLowerCase()) {
      case "energia":
      case "energy":
        return "bg-pink-500 hover:bg-pink-600" // ENERGÍA = ROSA
      case "alimentacion":
      case "nutrition":
        return "bg-green-500 hover:bg-green-600" // ALIMENTACIÓN = VERDE
      case "meditacion":
      case "meditation":
        return "bg-purple-500 hover:bg-purple-600" // MEDITACIÓN = MORADO
      case "negocio":
      case "negocios":
      case "business":
        return "bg-blue-500 hover:bg-blue-600" // NEGOCIO = AZUL
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-pink-500 border-pink-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando productos...</p>
          <p className="text-sm text-gray-500 mt-2">Categoría: {displayCategory}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link href="/productos/e-kit" className="text-orange-500 hover:text-orange-600 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a e-kit
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">E-Kit</h2>
          <h1 className="text-5xl md:text-6xl font-black capitalize">{displayCategory}</h1>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 text-lg font-medium mb-2">Error al cargar productos</div>
              <p className="text-red-500 mb-4">{error}</p>
              <div className="space-y-2">
                <Button className="w-full bg-pink-500 hover:bg-pink-600" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => router.push("/productos/e-kit")}
                >
                  Volver a e-kits
                </Button>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-gray-600 text-lg font-medium mb-2">Sin productos</div>
              <p className="text-gray-500 mb-4">No hay productos disponibles en la categoría {displayCategory}.</p>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/productos/e-kit")}>
                Volver a e-kits
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product) => {
              const isPurchased = isAuthenticated && purchasedProducts.includes(product.id)
              const finalPrice = Number.parseFloat(product.price)
              return (
                <div
                  key={product.id}
                  className="flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  {/* Imagen del producto */}
                  <div className="relative w-64 h-48 mb-6 bg-gray-50 rounded-lg overflow-hidden">
                    <Image
                      src={product.image || "/placeholder.svg?height=200&width=200&query=kids+education"}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=200&width=200"
                      }}
                    />
                    {isPurchased && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ✓ ADQUIRIDO
                      </div>
                    )}
                  </div>

                  {/* Nombre del producto */}
                  <h3 className="text-xl font-bold text-center mb-2 line-clamp-2">{product.name}</h3>

                  {/* Autor si existe */}
                  {product.author && <p className="text-gray-600 text-sm mb-2">Por {product.author}</p>}

                  {/* Categoría con color actualizado */}
                  <p className={`${getCategoryColor(category)} font-medium mb-4`}>{displayCategory}</p>

                  {/* Precio */}
                  {!isPurchased && (
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center mb-1">
                        <span className="text-lg font-bold">
                          {currencyLoading ? (
                            <span className="animate-pulse bg-gray-200 rounded px-3 py-1">Cargando...</span>
                          ) : (
                            formatPrice(finalPrice)
                          )}
                        </span>
                      </div>
                      {/* Mostrar precio en USD como referencia si no es USD */}
                      {!currencyLoading && currency.code !== "USD" && (
                        <p className="text-gray-500 text-sm">Precio original: ${finalPrice.toFixed(2)} USD</p>
                      )}
                      {/* Información específica para Bolivia */}
                      {currency.code === "BOB" && (
                        <p className="text-gray-500 text-xs">Cambio oficial del BCB aplicado</p>
                      )}
                    </div>
                  )}

                  {isPurchased && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                      <p className="text-green-600 text-sm font-medium">
                        ¡Ya tienes este e-kit! Accede a tu contenido.
                      </p>
                    </div>
                  )}

                  {/* Botón de acción con color actualizado */}
                  <Button
                    className={`${getButtonColor(category, isPurchased)} text-white px-6 py-2 flex items-center gap-2 rounded-xl`}
                    onClick={() => handleProductAction(product.id)}
                    disabled={currencyLoading}
                  >
                    {isPurchased ? (
                      <>
                        Continuar <ArrowRight className="h-4 w-4" />
                      </>
                    ) : product.isFree ? (
                      <>
                        Gratis <CheckCircle className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        Comprar <ShoppingCart className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        {/* Mensaje para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="mt-12 max-w-2xl mx-auto text-center p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-xl font-bold text-blue-900 mb-2">¿Ya tienes una cuenta?</h3>
            <p className="text-blue-700 mb-4">
              Inicia sesión para ver tus e-kit comprados y acceder a tu biblioteca personal.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2"
            >
              Iniciar Sesión
            </Button>
          </div>
        )}

        {/* Debug info en desarrollo */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm text-gray-600">
            <strong>Debug Info:</strong>
            <br />
            URL Category: {category}
            <br />
            API Category: {finalApiCategory}
            <br />
            Display Category: {displayCategory}
            <br />
            Products Count: {products.length}
            <br />
            Purchased Products: {purchasedProducts.length}
            <br />
            Currency: {currency.code}
          </div>
        )}
      </div>
    </div>
  )
}
