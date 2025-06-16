"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react"
import { WhatsappIcon } from "@/components/icons"

interface CoursePageProps {
  params: {
    id: string
  }
}

export default function BuyCourse({ params }: CoursePageProps) {
  const [quantity, setQuantity] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // En un caso real, estos datos vendrían de una base de datos
  const courses = [
    {
      id: 1,
      title: "TINDER DE EMPRENDEDORES",
      slug: "tinder-emprendedores",
      description:
        "¡Bienvenido al Curso de Tinder de Emprendedores!\n\nEste curso está diseñado para ayudarte a optimizar tus ventas con estrategias comerciales que integran lo físico y lo digital eficazmente. Ya sea que estés buscando potenciar tu marca, lanzar una carrera como creador de contenido, o simplemente aprender a usar estrategias de venta efectivas, este curso es para ti.",
      price: 99.99,
      images: ["/tinder-emprendedores.jpg", "/tinder-emprendedores-2.jpg", "/tinder-emprendedores-3.jpg"],
      author: "optimizadorbo",
      category: "cursos",
    },
    {
      id: 2,
      title: "CÁPSULA DE EMPRENDEDORES",
      slug: "capsula-emprendedores",
      description:
        "¡Bienvenido al Curso Cápsula de Emprendedores!\n\nEste curso está diseñado para padres y tutores que quieren enseñar finanzas a sus hijos con juegos, valores y responsabilidad. Ya sea que estés buscando potenciar el futuro financiero de tus hijos, enseñarles sobre el valor del dinero, o simplemente darles herramientas para su futuro, este curso es para ti.",
      price: 129.99,
      images: ["/capsula-emprendedores.jpg", "/capsula-emprendedores-2.jpg", "/capsula-emprendedores-3.jpg"],
      author: "optimizadorbo",
      category: "cursos",
    },
    {
      id: 3,
      title: "RETO-7-DÍAS",
      slug: "reto-7-dias",
      description:
        "¡Bienvenido al Curso Reto de 7 Días!\n\nEste curso está diseñado para ayudarte a crear y validar tu idea de negocio desde cero, con pasos claros y estratégicos. Ya sea que estés buscando potenciar tu marca, lanzar una carrera como emprendedor, o simplemente aprender a validar ideas de manera efectiva, este curso es para ti.",
      price: 15.0,
      images: ["/desafio-7dias.jpg", "/desafio-7dias-2.jpg", "/desafio-7dias-3.jpg"],
      author: "optimizadorbo",
      category: "cursos",
    },
  ]

  const course = courses.find((c) => c.id === Number.parseInt(params.id))

  if (!course) {
    return <div className="min-h-screen flex items-center justify-center">Curso no encontrado</div>
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
    setCurrentImageIndex((prev) => (prev === 0 ? course.images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === course.images.length - 1 ? 0 : prev + 1))
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
                src={course.images[currentImageIndex] || "/placeholder.svg"}
                alt={course.title}
                fill
                className="object-cover"
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
                {course.images.map((image, index) => (
                  <div
                    key={index}
                    className={`relative h-20 w-20 flex-shrink-0 cursor-pointer ${
                      currentImageIndex === index ? "ring-2 ring-orange-500" : ""
                    }`}
                    onClick={() => handleThumbnailClick(index)}
                  >
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${course.title} ${index + 1}`}
                      fill
                      className="object-cover"
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
                  <span>{course.title} Ha sido agregado a tu carro.</span>
                </div>
                <Link href="/carrito">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white">Ver Carro</Button>
                </Link>
              </div>
            )}

            <h1 className="text-3xl md:text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">by {course.author}</p>

            <div className="mb-6">
              {course.description.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Button
                className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2 py-6"
                onClick={() =>
                  window.open(`https://wa.me/59174320129?text=Me%20interesa%20el%20curso%20${course.slug}`, "_blank")
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
              <h2 className="text-4xl font-bold mb-4">${course.price.toFixed(2)}</h2>
              <p className="text-gray-600">
                Categoría: <span className="font-medium">{course.category}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
