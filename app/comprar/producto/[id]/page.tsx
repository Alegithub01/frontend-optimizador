"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react"
import { WhatsappIcon } from "@/components/icons"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function BuyProduct({ params }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // En un caso real, estos datos vendrían de una base de datos
  const products = [
    {
      id: 1,
      title: "Libro: El Empleado Rico",
      slug: "libro-empleado-rico",
      description:
        "¡Descubre el camino hacia la libertad financiera!\n\nEste libro te enseñará cómo pasar de ser un empleado común a construir riqueza mientras trabajas. Aprenderás estrategias prácticas para invertir, ahorrar y crear fuentes de ingresos pasivos que te permitirán alcanzar la independencia financiera.",
      price: 24.99,
      images: ["/libro-empleado-rico.png", "/libro-empleado-rico-2.jpg", "/libro-empleado-rico-3.jpg"],
      author: "optimizadorbo",
      category: "libro",
    },
    {
      id: 2,
      title: "Revista OptiKids",
      slug: "revista-optikids",
      description:
        "¡La revista financiera para niños!\n\nOptiKids es una revista educativa diseñada para enseñar a los niños conceptos financieros de manera divertida y accesible. Cada número incluye juegos, actividades, cómics y artículos que introducen a los más pequeños al mundo del dinero, el ahorro y el emprendimiento.",
      price: 9.99,
      images: ["/revista-optikids.png", "/revista-optikids-2.jpg", "/revista-optikids-3.jpg"],
      author: "optimizadorbo",
      category: "revista",
    },
    {
      id: 3,
      title: "Gráficos de Ventas",
      slug: "graficos-ventas",
      description:
        "¡Visualiza y potencia tus ventas!\n\nEste conjunto de gráficos te ayudará a analizar y presentar tus datos de ventas de manera profesional y efectiva. Incluye plantillas personalizables para seguimiento mensual, comparativas anuales, análisis por producto y más.",
      price: 19.99,
      images: ["/graficos-ventas.png", "/graficos-ventas-2.jpg", "/graficos-ventas-3.jpg"],
      author: "optimizadorbo",
      category: "gráficos",
    },
  ]

  const product = products.find((p) => p.id === Number.parseInt(params.id))

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Producto no encontrado</div>
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleIncrease = () => {
    setQuantity(quantity + 1)
  }

  const handleAddToCart = () => {
    setAddedToCart(true)
    // Aquí iría la lógica para añadir al carrito
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="relative h-[400px] md:h-[500px] rounded-lg overflow-hidden mb-4">
              <Image
                src={product.images[currentImageIndex] || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-contain bg-gray-50"
              />
            </div>

            <div className="flex items-center">
              <button
                onClick={handlePrevImage}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex-1 overflow-x-auto py-2 px-4 flex gap-2 scrollbar-hide">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer ${
                      currentImageIndex === index ? "ring-2 ring-orange-500" : ""
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.title} ${index + 1}`}
                      fill
                      className="object-contain bg-gray-50"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleNextImage}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div>
            {addedToCart && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between mb-6">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  <span>{product.title} Ha sido agregado a tu carro.</span>
                </div>
                <Link href="/carrito">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">Ver Carro</Button>
                </Link>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
            <p className="text-gray-600 mb-4">by {product.author}</p>

            <div className="mb-6">
              {product.description.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 py-6"
                onClick={() =>
                  window.open(
                    `https://wa.me/59174320129?text=Me%20interesa%20el%20producto%20${product.slug}`,
                    "_blank",
                  )
                }
              >
                <WhatsappIcon className="h-5 w-5" />
                Compra física
              </Button>

              <div className="flex items-center">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 h-12 w-12 p-0"
                  onClick={handleDecrease}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="h-12 w-16 flex items-center justify-center border-t border-b border-gray-300">
                  {quantity}
                </div>
                <Button
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-100 h-12 w-12 p-0"
                  onClick={handleIncrease}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 py-6 flex-1"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-5 w-5" />
                Añadir Al Carrito
              </Button>
            </div>

            <div className="mt-8">
              <h2 className="text-4xl font-bold mb-4">${product.price.toFixed(2)}</h2>
              <p className="text-gray-600">
                Categoría: <span className="font-medium">{product.category}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
