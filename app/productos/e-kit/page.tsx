"use client"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EKidsPage() {
  const ekids = [
    {
      id: "energia",
      name: "Energia",
      color: "blue",
      href: "/productos/e-kit/energia",
      apiCategory: "ENERGY",
    },
    {
      id: "alimentacion",
      name: "Alimentacion",
      color: "green",
      href: "/productos/e-kit/alimentacion",
      apiCategory: "NUTRITION",
    },
    {
      id: "meditacion",
      name: "Meditacion",
      color: "purple",
      href: "/productos/e-kit/meditacion",
      apiCategory: "MEDITATION",
    },
    {
      id: "negocio",
      name: "Negocio",
      color: "orange",
      href: "/productos/e-kit/negocios",
      apiCategory: "BUSINESS",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link href="/productos" className="text-orange-700 hover:text-orange-600 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a productos
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">Categoría</h2>
          <h1 className="text-5xl md:text-6xl font-black">E-KITS</h1>
        </div>

        {/* Grid de E-Kids */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {ekids.map((ekid) => (
            <div key={ekid.id} className="flex flex-col items-center">
              {/* Imagen del e-kid */}
              <div className="relative mb-6 w-64 h-48">
                <Image
                  src={`/toolkits/${ekid.id}.png`}
                  alt={ekid.name}
                  width={256}
                  height={192}
                  className="rounded-lg object-cover"
                />
              </div>

              {/* Título */}
              <h3 className="text-2xl font-bold mb-6 text-center">{ekid.name}</h3>

              {/* Botón Ver más */}
              <Link href={ekid.href}>
                <Button className="bg-orange-700 hover:bg-orange-600 text-white px-6 py-2 rounded-xl">Ver más →</Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
