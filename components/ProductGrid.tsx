"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
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

interface CurrencyInfo {
  code: string
  symbol: string
  rate: number
  country?: string
}

// Mapeo de países a sus monedas y tasas de cambio por defecto
const COUNTRY_CURRENCIES: Record<string, CurrencyInfo> = {
  BO: { code: "BOB", symbol: "Bs", rate: 6.96, country: "Bolivia" },
  AR: { code: "ARS", symbol: "$", rate: 800, country: "Argentina" },
  CL: { code: "CLP", symbol: "$", rate: 850, country: "Chile" },
  CO: { code: "COP", symbol: "$", rate: 3800, country: "Colombia" },
  MX: { code: "MXN", symbol: "$", rate: 17, country: "México" },
  PE: { code: "PEN", symbol: "S/", rate: 3.7, country: "Perú" },
  ES: { code: "EUR", symbol: "€", rate: 0.92, country: "España" },
  US: { code: "USD", symbol: "$", rate: 1, country: "Estados Unidos" },
  // Puedes agregar más países aquí
}

export default function ProductGrid({ products, category, isLoading }: ProductGridProps) {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>({
    code: "USD",
    symbol: "$",
    rate: 1,
    country: "Estados Unidos"
  })
  const [currencyDetectionError, setCurrencyDetectionError] = useState(false)

  const parsePrice = (price: string | number): number =>
    typeof price === "string" ? parseFloat(price) : price

  useEffect(() => {
    const detectCurrencyByIP = async () => {
      try {
        // Primero intentamos con una API simple
        const ipRes = await fetch("https://ipapi.co/json/")
        if (!ipRes.ok) throw new Error("Error en la API de geolocalización")
        
        const ipData = await ipRes.json()
        const countryCode = ipData.country_code || "US"
        
        // Verificamos si tenemos información para este país
        if (COUNTRY_CURRENCIES[countryCode]) {
          setCurrencyInfo(COUNTRY_CURRENCIES[countryCode])
          return
        }

        // Si no tenemos info para este país, intentamos obtener la moneda
        const currencyCode = ipData.currency || "USD"
        
        // Si es USD no necesitamos conversión
        if (currencyCode === "USD") {
          setCurrencyInfo({
            code: "USD",
            symbol: "$",
            rate: 1,
            country: ipData.country_name || "Estados Unidos"
          })
          return
        }

        // Intentamos obtener la tasa de cambio actualizada
        try {
          const rateRes = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
          const rateData = await rateRes.json()
          const rate = rateData.rates[currencyCode] || 1
          
          setCurrencyInfo({
            code: currencyCode,
            symbol: currencyCode === "EUR" ? "€" : "$", // Símbolo genérico
            rate: rate,
            country: ipData.country_name || "Desconocido"
          })
        } catch {
          // Si falla la API de tasas, usamos valores por defecto
          setCurrencyInfo({
            code: currencyCode,
            symbol: "$",
            rate: 1,
            country: ipData.country_name || "Desconocido"
          })
        }

      } catch (error) {
        console.error("Error detectando moneda:", error)
        setCurrencyDetectionError(true)
        // Valores por defecto en caso de error
        setCurrencyInfo({
          code: "USD",
          symbol: "$",
          rate: 1,
          country: "Estados Unidos"
        })
      }
    }

    detectCurrencyByIP()
  }, [])

  // Función para formatear el precio según la moneda
  const formatPrice = (price: number) => {
    if (currencyInfo.code === "BOB") {
      return price.toFixed(2)
    } else if (["ARS", "CLP", "COP"].includes(currencyInfo.code)) {
      return Math.round(price).toString()
    } else {
      return price.toFixed(2)
    }
  }

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
            <Button className="bg-orange-700 hover:bg-orange-600 text-white">
              Volver a categorías
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        {currencyDetectionError && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <p>No pudimos detectar tu ubicación. Mostrando precios en dólares (USD).</p>
          </div>
        )}

        <h1 className="text-4xl font-bold text-center mb-12 capitalize">{category}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => {
            const priceUSD = parsePrice(product.price)
            const localPrice = formatPrice(priceUSD * currencyInfo.rate)
            const originalPriceLocal = product.originalPrice
              ? formatPrice(parsePrice(product.originalPrice) * currencyInfo.rate)
              : null

            return (
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
                        <Button className="rounded-full bg-orange-700 hover:bg-orange-600 text-white">
                          Ver detalles <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold line-clamp-2">{product.name}</h2>
                  {product.author && <p className="text-black font-light text-sm mt-1">Por {product.author}</p>}

                  <div className="mt-auto pt-4">
                    <div className="flex items-center">
                      <span className="text-black font-bold text-lg">
                        {currencyInfo.symbol} {localPrice}
                        <span className="text-xs ml-1">{currencyInfo.code}</span>
                      </span>
                      {product.discount && originalPriceLocal && (
                        <span className="ml-2 text-gray-500 line-through text-sm">
                          {currencyInfo.symbol} {originalPriceLocal}
                        </span>
                      )}
                    </div>

                    {product.discount && (
                      <p className="text-red-500 text-sm">{product.discount}% Dto</p>
                    )}

                    <p className="text-gray-600 font-light text-sm mb-4">
                      USD ${priceUSD.toFixed(2)}
                    </p>

                    <div className="flex space-x-2">
                      <Link href={`/productos/${category}/${product.id}`} className="flex-1">
                        <Button 
                          variant="outline" 
                          className="rounded-full w-full bg-orange-700 text-white hover:bg-orange-600 hover:text-white"
                        >
                          Ver más
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}