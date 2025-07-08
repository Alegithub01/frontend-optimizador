"use client"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function ProductsPage() {
  const categories = [
    {
      id: 1,
      title: "Libros",
      image: "/libro.png",
      href: "/productos/libro",
    },
    {
      id: 2,
      title: "Revistas",
      image: "/revista.png",
      href: "/productos/revista",
    },
    {
      id: 4, // E-kit ahora es el tercer elemento
      title: "E-kit",
      image: "/ekit.png",
      href: "/productos/e-kit",
    },
    {
      id: 3, // Toolkit pasa a ser el cuarto elemento
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
          {/* Columna 1 - Libros */}
          <div className="md:row-span-2 flex flex-col items-center">
            <div className="relative h-80 w-full mb-4">
              <Image
                src={categories[0].image || "/placeholder.svg"}
                alt={categories[0].title}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-center">{categories[0].title}</h3>
            <Link href={categories[0].href}>
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </Link>
          </div>

          {/* Columna 2 - Revistas y E-kit */}
          <div className="space-y-8">
            {/* Revistas */}
            <div className="flex flex-col items-center">
              <div className="relative h-80 w-full mb-4">
                <Image
                  src={categories[1].image || "/placeholder.svg"}
                  alt={categories[1].title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">{categories[1].title}</h3>
              <Link href={categories[1].href}>
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
              </Link>
            </div>

            {/* E-kit */}
            <div className="flex flex-col items-center">
              <div className="relative h-80 w-full mb-4">
                <Image
                  src={categories[2].image || "/placeholder.svg"}
                  alt={categories[2].title}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold mb-6 text-center">{categories[2].title}</h3>
              <Link href={categories[2].href}>
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                  <ArrowRight className="h-5 w-5 text-white" />
                </div>
              </Link>
            </div>
          </div>

          {/* Columna 3 - Toolkit */}
          <div className="flex flex-col items-center">
            <div className="relative h-80 w-full mb-4">
              <Image
                src={categories[3].image || "/placeholder.svg"}
                alt={categories[3].title}
                fill
                className="object-contain"
              />
            </div>
            <h3 className="text-2xl font-bold mb-6 text-center">{categories[3].title}</h3>
            <Link href={categories[3].href}>
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-colors">
                <ArrowRight className="h-5 w-5 text-white" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}