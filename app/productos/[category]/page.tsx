"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
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
}

export default function CategoryPage({ params }: { params: { category: string } }) {
  const router = useRouter()
  const { category } = params
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Si es toolkit, redirigir a la página específica
    if (category === "toolkit") {
      router.push("/productos/toolkit")
      return
    }

    const fetchProducts = async () => {
      try {
        setLoading(true)
        const data = await api.get<Product[]>(`/product/category/${category}`)
        setProducts(data)
      } catch (error) {
        console.error("Error al cargar los productos:", error)
      } finally {
        setLoading(false)
      }
    }

    if (category === "libro" || category === "revista") {
      fetchProducts()
    }
  }, [category, router])

  // Solo renderizar para libro y revista
  if (category !== "libro" && category !== "revista") {
    return null // No renderizar nada mientras se redirige
  }

  return <ProductGrid products={products} category={category} isLoading={loading} />
}
