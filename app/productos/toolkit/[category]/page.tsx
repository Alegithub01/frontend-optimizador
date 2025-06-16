"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

interface ToolkitProduct {
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

export default function ToolkitCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const [products, setProducts] = useState<ToolkitProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log(`🔍 URL Category from params: "${category}"`)
        console.log(`🔄 Mapped API Category: "${finalApiCategory}"`)
        console.log(`📡 Final API URL: /product/category/toolkit/${finalApiCategory}`)

        // Validar que tenemos una categoría válida
        if (!finalApiCategory || !["ENERGY", "NUTRITION", "MEDITATION", "BUSINESS"].includes(finalApiCategory)) {
          throw new Error(`Categoría inválida: ${category} -> ${finalApiCategory}`)
        }

        // Llamar a la API para obtener los productos de la subcategoría
        const data = await api.get<ToolkitProduct[]>(`/product/category/toolkit/${finalApiCategory}`)

        console.log("✅ Products received:", data)
        setProducts(data)

        if (data.length === 0) {
          setError("No hay productos disponibles en esta categoría.")
        }
      } catch (error) {
        console.error("❌ Error fetching toolkit products:", error)
        setError("Error al cargar los productos. Verifica tu conexión e intenta de nuevo.")
        setProducts([]) // Limpiar productos en caso de error
      } finally {
        setLoading(false)
      }
    }

    if (category) {
      fetchProducts()
    }
  }, [category, finalApiCategory])

  // Función para obtener el color según la categoría
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "energia":
      case "energy":
        return "text-blue-500"
      case "alimentacion":
      case "nutrition":
        return "text-green-500"
      case "meditacion":
      case "meditation":
        return "text-purple-500"
      case "negocio":
      case "business":
        return "text-orange-500"
      default:
        return "text-blue-500"
    }
  }

  // Función para obtener el color del botón según la categoría
  const getButtonColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "energia":
      case "energy":
        return "bg-blue-500 hover:bg-blue-600"
      case "alimentacion":
      case "nutrition":
        return "bg-green-500 hover:bg-green-600"
      case "meditacion":
      case "meditation":
        return "bg-purple-500 hover:bg-purple-600"
      case "negocio":
      case "business":
        return "bg-orange-500 hover:bg-orange-600"
      default:
        return "bg-blue-500 hover:bg-blue-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
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
          <Link href="/productos/toolkit" className="text-orange-500 hover:text-orange-600 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a toolkits
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">Toolkit</h2>
          <h1 className="text-5xl md:text-6xl font-black capitalize">{displayCategory}</h1>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-red-600 text-lg font-medium mb-2">Error al cargar productos</div>
              <p className="text-red-500 mb-4">{error}</p>
              <div className="space-y-2">
                <Button className="w-full bg-orange-500 hover:bg-orange-600" onClick={() => window.location.reload()}>
                  Reintentar
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/productos/toolkit")}>
                  Volver a toolkits
                </Button>
              </div>
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
              <div className="text-gray-600 text-lg font-medium mb-2">Sin productos</div>
              <p className="text-gray-500 mb-4">No hay productos disponibles en la categoría {displayCategory}.</p>
              <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => router.push("/productos/toolkit")}>
                Volver a toolkits
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {products.map((product) => (
              <div key={product.id} className="flex flex-col items-center">
                {/* Imagen del producto */}
                <div className="relative w-64 h-48 mb-6 bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src={product.image || "/placeholder.svg?height=200&width=200&query=toolkit+briefcase"}
                    alt={product.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>

                {/* Nombre del producto */}
                <h3 className="text-xl font-bold text-center mb-2 line-clamp-2">{product.name}</h3>

                {/* Autor si existe */}
                {product.author && <p className="text-gray-600 text-sm mb-2">Por {product.author}</p>}

                {/* Categoría */}
                <p className={`${getCategoryColor(category)} font-medium mb-4`}>{displayCategory}</p>

                {/* Precio */}
                <div className="text-center mb-4">
                  <p className="font-bold text-lg">${product.price} USD</p>
                  <p className="text-gray-500 text-sm">Bolivia cambio oficial: 6.96 bs</p>
                </div>

                {/* Badge de producto digital */}
                <div className="mb-4">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    📱 Producto Digital
                  </span>
                </div>

                {/* Botón de compra */}
                <Link href={`/productos/toolkit/${category}/${product.id}`}>
                  <Button className={`${getButtonColor(category)} text-white px-6 py-2`}>Ver detalles →</Button>
                </Link>
              </div>
            ))}
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
          </div>
        )}
      </div>
    </div>
  )
}
