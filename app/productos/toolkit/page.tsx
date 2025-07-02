"use client"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ToolkitPage() {
  const toolkits = [
    {
      id: "energia",
      name: "Energia",
      color: "blue",
      href: "/productos/toolkit/energia",
      apiCategory: "ENERGY",
    },
    {
      id: "alimentacion",
      name: "Alimentacion",
      color: "green",
      href: "/productos/toolkit/alimentacion",
      apiCategory: "NUTRITION",
    },
    {
      id: "meditacion",
      name: "Meditacion",
      color: "purple",
      href: "/productos/toolkit/meditacion", // corregido el href
      apiCategory: "MEDITATION",
    },
    {
      id: "negocio",
      name: "Negocio",
      color: "orange",
      href: "/productos/toolkit/negocios",
      apiCategory: "BUSINESS",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link href="/productos" className="text-orange-500 hover:text-orange-600 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a productos
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">Categoría</h2>
          <h1 className="text-5xl md:text-6xl font-black">TOOLKITS</h1>
        </div>

        {/* Grid de Toolkits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {toolkits.map((toolkit) => (
            <div key={toolkit.id} className="flex flex-col items-center">
              {/* Imagen del toolkit */}
              <div className="relative mb-6 w-64 h-48">
                <Image
                  src={`/toolkits/${toolkit.id}.png`}
                  alt={toolkit.name}
                  width={256}
                  height={192}
                  className="rounded-lg object-cover"
                />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold mb-6 text-center">{toolkit.name}</h3>

              {/* Botón Ver más */}
              <Link href={toolkit.href}>
                <Button className="bg-orange-700 hover:bg-orange-600 text-white px-6 py-2 rounded-xl ">
                  Ver más →
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
