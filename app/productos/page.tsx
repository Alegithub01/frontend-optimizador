"use client"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function ProductsPage() {
  const categories = [
    {
      id: 1,
      title: "Libros",
      image: "/libro.jpg",
      href: "/productos/libro",
    },
    {
      id: 2,
      title: "Revistas",
      image: "/revista.jpg",
      href: "/productos/revista",
    },
    {
      id: 3,
      title: "Toolkit",
      image: "/blanco.png",
      href: "/productos/toolkit",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">Categoría</h2>
          <h1 className="text-5xl md:text-6xl font-black">PRODUCTOS</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col items-center">
              <div className="relative h-80 w-full mb-4">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.title}
                  fill
                  className="object-contain"
                />
              </div>

              <h3 className="text-2xl font-bold mb-6 text-center">{category.title}</h3>

              <Link href={category.href}>
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
