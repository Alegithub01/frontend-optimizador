"use client"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"

interface Proyecto {
  id: string
  title: string
  image: string
  link: string
  featured?: boolean
}

export default function ProyectosSection() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProyectos()
  }, [])

  const loadProyectos = async () => {
    try {
      const response = await fetch("/api/proyectos")
      if (response.ok) {
        const data = await response.json()
        setProyectos(data)
      }
    } catch (error) {
      console.error("Error loading proyectos:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="container mx-auto py-12 md:py-16 px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-lg font-medium text-orange-700">Categoría</h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">PROYECTOS</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </section>
    )
  }

  const proyectoDestacado = proyectos.find((proyecto) => proyecto.featured)
  const proyectosRegulares = proyectos.filter((proyecto) => !proyecto.featured)

  return (
    <section className="container mx-auto py-12 md:py-16 px-4">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-lg font-medium text-orange-700">Categoría</h2>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">PROYECTOS</h3>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-8">
        {/* Proyecto destacado primero en móvil */}
        {proyectoDestacado && <ProyectoCard proyecto={proyectoDestacado} featured />}
        {/* Resto de proyectos en columna con espacio y tamaño fijo */}
        <div className="space-y-8">
          {proyectosRegulares.map((proyecto) => (
            <div key={proyecto.id}>
              <ProyectoCard proyecto={proyecto} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1fr_0.7fr] gap-6 px-4">
          {/* Primera columna (2 proyectos) */}
          <div className="flex flex-col gap-6">
            {proyectosRegulares.slice(0, 2).map((proyecto) => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>

          {/* Columna central (proyecto destacado) */}
          {proyectoDestacado && (
            <div>
              <ProyectoCard proyecto={proyectoDestacado} featured />
            </div>
          )}

          {/* Tercera columna (2 proyectos) */}
          <div className="flex flex-col gap-6">
            {proyectosRegulares.slice(2, 4).map((proyecto) => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProyectoCard({ proyecto, featured = false }: { proyecto: Proyecto; featured?: boolean }) {
  return (
    <Link href={proyecto.link} className="group">
      <div
        className={`relative rounded-2xl md:rounded-3xl overflow-hidden transition-transform duration-300 group-hover:scale-[0.98] ${
          featured ? "h-[300px] md:h-[400px]" : "h-[300px] md:h-[200px]"
        }`}
      >
        <Image
          src={proyecto.image || "/placeholder.svg"}
          alt={proyecto.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
        {featured && proyecto.title && (
          <div className="absolute top-1/4 left-0 right-0 text-center text-white">
            <div className="text-2xl md:text-4xl font-bold">{proyecto.title}</div>
          </div>
        )}
        <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-orange-700 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
