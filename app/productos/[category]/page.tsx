"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { useCurrency } from "@/hooks/use-currency"
import ProductGrid from "@/components/ProductGrid"

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
  isFree?: boolean // Added isFree property to handle free products
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

// Nueva interfaz para manejar las versiones compradas
interface PurchasedProductInfo {
  id: string
  deliveryTypes: ("digital" | "physical")[]
  hasDigital: boolean
  hasPhysical: boolean
  hasBoth: boolean
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const router = useRouter()
  const { category } = params
  const { isAuthenticated, user } = useAuthContext()
  const { formatPrice, currency, isLoading: currencyLoading } = useCurrency()
  const [products, setProducts] = useState<Product[]>([])
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]) // Para compatibilidad con ProductGrid
  const [purchasedProductsInfo, setPurchasedProductsInfo] = useState<PurchasedProductInfo[]>([]) // Info detallada
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si es toolkit, redirigir a la página específica
    if (category === "toolkit") {
      router.push("/productos/toolkit")
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)

        // Obtener productos de la categoría
        const productsData = await api.get<Product[]>(`/product/category/${category}`)
        setProducts(productsData)
        console.log("📚 Productos obtenidos:", productsData)

        // Obtener productos comprados por el usuario si está autenticado
        if (isAuthenticated && user?.id) {
          try {
            console.log(`🔍 Haciendo fetch a: /sales/user/${user.id}/products`)
            const purchasedData = await api.get<PurchasedProduct[]>(`/sales/user/${user.id}/products`)
            console.log("🛒 Respuesta de productos comprados:", purchasedData)

            // Solo considerar productos con status "paid" y de la categoría actual
            const paidProducts = purchasedData.filter(
              (purchase) => purchase.status === "paid" && purchase.product.category === category,
            )

            // Agrupar por producto ID y delivery type
            const productMap = new Map<string, ("digital" | "physical")[]>()

            paidProducts.forEach((purchase) => {
              const productId = purchase.product.id
              const deliveryType = purchase.deliveryType

              if (!productMap.has(productId)) {
                productMap.set(productId, [])
              }

              const deliveryTypes = productMap.get(productId)!
              if (!deliveryTypes.includes(deliveryType)) {
                deliveryTypes.push(deliveryType)
              }
            })

            // Crear info detallada de productos comprados
            const purchasedInfo: PurchasedProductInfo[] = Array.from(productMap.entries()).map(
              ([id, deliveryTypes]) => ({
                id,
                deliveryTypes,
                hasDigital: deliveryTypes.includes("digital"),
                hasPhysical: deliveryTypes.includes("physical"),
                hasBoth: deliveryTypes.includes("digital") && deliveryTypes.includes("physical"),
              }),
            )

            // Para compatibilidad con ProductGrid, mantener array simple de IDs
            const purchasedProductIds = Array.from(productMap.keys())

            console.log("🛒 Info detallada de productos comprados:", purchasedInfo)
            console.log("🛒 IDs de productos comprados:", purchasedProductIds)

            setPurchasedProductsInfo(purchasedInfo)
            setPurchasedProducts(purchasedProductIds)
          } catch (error) {
            console.error("❌ Error fetching purchased products:", error)
            setPurchasedProductsInfo([])
            setPurchasedProducts([])
          }
        } else {
          setPurchasedProductsInfo([])
          setPurchasedProducts([])
        }
      } catch (error) {
        console.error("Error al cargar los productos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (category === "libro" || category === "revista") {
      fetchData()
    }
  }, [category, router, isAuthenticated, user])

  // Función actualizada para manejar las acciones según las versiones compradas
  const handleProductAction = (productId: string) => {
    if (!isAuthenticated) {
      // Si no está autenticado, ir a la página de detalle
      router.push(`/productos/${category}/${productId}`)
      return
    }

    // Buscar info del producto comprado
    const purchasedInfo = purchasedProductsInfo.find((p) => p.id === productId)

    if (!purchasedInfo) {
      // No ha comprado ninguna versión, ir a la página de detalle
      router.push(`/productos/${category}/${productId}`)
      return
    }

    if (purchasedInfo.hasBoth) {
      // Tiene ambas versiones, ir a mis-compras
      router.push(`/mis-compras/productos/${category}/${productId}`)
      return
    }

    if (purchasedInfo.hasDigital || purchasedInfo.hasPhysical) {
      // Tiene solo una versión, ir a la página de detalle para poder comprar la otra
      router.push(`/productos/${category}/${productId}`)
      return
    }
  }

  // Función para obtener el estado de compra de un producto
  const getProductPurchaseStatus = (productId: string) => {
    if (!isAuthenticated) {
      return { isPurchased: false, hasDigital: false, hasPhysical: false, hasBoth: false }
    }

    const purchasedInfo = purchasedProductsInfo.find((p) => p.id === productId)

    if (!purchasedInfo) {
      return { isPurchased: false, hasDigital: false, hasPhysical: false, hasBoth: false }
    }

    return {
      isPurchased: true,
      hasDigital: purchasedInfo.hasDigital,
      hasPhysical: purchasedInfo.hasPhysical,
      hasBoth: purchasedInfo.hasBoth,
    }
  }

  // Solo renderizar para libro y revista
  if (category !== "libro" && category !== "revista") {
    return null // No renderizar nada mientras se redirige
  }

  return (
    <ProductGrid
      products={products}
      category={category}
      isLoading={loading}
      purchasedProducts={purchasedProducts}
      purchasedProductsInfo={purchasedProductsInfo} // Nueva prop con info detallada
      formatPrice={formatPrice}
      currency={currency}
      currencyLoading={currencyLoading}
      isAuthenticated={isAuthenticated}
      onProductAction={handleProductAction} // Función personalizada
      getProductPurchaseStatus={getProductPurchaseStatus} // Función para obtener estado
    />
  )
}
