"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  author?: string
  price: string | number
  originalPrice?: string | number
  discount?: number
  image: string
  stock: number
  category: "libro" | "revista" | "toolkit"
  description?: string
  createdAt?: string
  updatedAt?: string
}

interface ProductGridProps {
  products: Product[]
  category: string
  isLoading: boolean
}

export default function ProductGrid({ products, category, isLoading }: ProductGridProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
        <p className="ml-4 text-xl">Cargando productos...</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-6 capitalize">{category}</h1>
          <p className="text-xl">No hay productos disponibles en esta categoría.</p>
          <Link href="/productos" className="mt-8 inline-block">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Volver a categorías</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Función para convertir precio a número si es string
  const parsePrice = (price: string | number): number => {
    if (typeof price === "string") {
      return Number.parseFloat(price)
    }
    return price
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold text-center mb-12 capitalize">{category}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              <div className="relative h-80 w-full">
                <Image
                  src={product.image || "/placeholder.svg?height=320&width=240&query=book"}
                  alt={product.name}
                  fill
                  className="object-contain p-4"
                />
                {hoveredProduct === product.id && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Link href={`/productos/${category}/${product.id}`}>
                      <Button className="bg-white text-orange-500 hover:bg-orange-50">
                        Ver detalles <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold line-clamp-2">{product.name}</h2>
                {product.author && <p className="text-gray-600 text-sm mt-1">Por {product.author}</p>}

                <div className="mt-auto pt-4">
                  <div className="flex items-center">
                    <span className="text-orange-500 font-bold text-lg">
                      ${parsePrice(product.price).toFixed(2)} USD
                    </span>
                    {product.discount && product.originalPrice && (
                      <span className="ml-2 text-gray-500 line-through text-sm">
                        ${parsePrice(product.originalPrice).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {product.discount && <p className="text-red-500 text-sm">{product.discount}% Dto</p>}

                  <p className="text-gray-500 text-sm mb-4">Bolivia cambio oficial: 6.96 bs</p>

                  <div className="flex space-x-2">
                    <Link href={`/productos/${category}/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-50">
                        Ver más
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
