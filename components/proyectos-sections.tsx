"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import { proyectosData, type Proyecto } from "@/data/proyectos"

export default function ProyectosSection() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosData)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    // Cargar proyectos editados desde localStorage si existen
    const savedProyectos = localStorage.getItem("proyectosData")
    if (savedProyectos) {
      try {
        const parsedProyectos = JSON.parse(savedProyectos)
        setProyectos(parsedProyectos)
      } catch (error) {
        console.error("Error parsing saved proyectos:", error)
        setProyectos(proyectosData)
      }
    }

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "proyectosData" && e.newValue) {
        try {
          const updatedProyectos = JSON.parse(e.newValue)
          setProyectos(updatedProyectos)
        } catch (error) {
          console.error("Error parsing updated proyectos:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleSave = () => {
    localStorage.setItem("proyectosData", JSON.stringify(proyectos))
    setIsEditing(false)
    alert("Proyectos guardados exitosamente!")
  }

  const handleProyectoChange = (index: number, field: keyof Proyecto, value: string | boolean) => {
    setProyectos((prev) => prev.map((proyecto, i) => (i === index ? { ...proyecto, [field]: value } : proyecto)))
  }

  const addProyecto = () => {
    const newProyecto: Proyecto = {
      id: Date.now().toString(),
      title: "Nuevo Proyecto",
      image: "/placeholder.svg?height=200&width=300",
      link: `/proyectos/${Date.now()}`,
      featured: false,
      description: "Descripción del nuevo proyecto",
    }
    setProyectos((prev) => [...prev, newProyecto])
  }

  const removeProyecto = (index: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este proyecto?")) {
      setProyectos((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const proyectoDestacado = proyectos.find((proyecto) => proyecto.featured)
  const proyectosRegulares = proyectos.filter((proyecto) => !proyecto.featured)

  return (
    <section className="container mx-auto py-12 md:py-16 px-4 relative">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="text-xs text-gray-500">
              {user?.name} ({user?.role?.toUpperCase()})
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                >
                  Guardar
                </button>
                <button
                  onClick={addProyecto}
                  className="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600"
                >
                  + Agregar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-lg font-medium text-orange-700">Categoría</h2>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">PROYECTOS</h3>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-8">
        {/* Proyecto destacado primero en móvil */}
        {proyectoDestacado && (
          <ProyectoCard
            proyecto={proyectoDestacado}
            featured
            isEditing={isEditing}
            onEdit={(field, value) => {
              const index = proyectos.findIndex((p) => p.id === proyectoDestacado.id)
              if (index !== -1) handleProyectoChange(index, field, value)
            }}
            onRemove={() => {
              const index = proyectos.findIndex((p) => p.id === proyectoDestacado.id)
              if (index !== -1) removeProyecto(index)
            }}
          />
        )}

        {/* Resto de proyectos en columna con espacio y tamaño fijo */}
        <div className="space-y-8">
          {proyectosRegulares.map((proyecto, idx) => (
            <div key={proyecto.id}>
              <ProyectoCard
                proyecto={proyecto}
                isEditing={isEditing}
                onEdit={(field, value) => {
                  const index = proyectos.findIndex((p) => p.id === proyecto.id)
                  if (index !== -1) handleProyectoChange(index, field, value)
                }}
                onRemove={() => {
                  const index = proyectos.findIndex((p) => p.id === proyecto.id)
                  if (index !== -1) removeProyecto(index)
                }}
              />
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
              <ProyectoCard
                key={proyecto.id}
                proyecto={proyecto}
                isEditing={isEditing}
                onEdit={(field, value) => {
                  const index = proyectos.findIndex((p) => p.id === proyecto.id)
                  if (index !== -1) handleProyectoChange(index, field, value)
                }}
                onRemove={() => {
                  const index = proyectos.findIndex((p) => p.id === proyecto.id)
                  if (index !== -1) removeProyecto(index)
                }}
              />
            ))}
          </div>

          {/* Columna central (proyecto destacado) */}
          {proyectoDestacado && (
            <div>
              <ProyectoCard
                proyecto={proyectoDestacado}
                featured
                isEditing={isEditing}
                onEdit={(field, value) => {
                  const index = proyectos.findIndex((p) => p.id === proyectoDestacado.id)
                  if (index !== -1) handleProyectoChange(index, field, value)
                }}
                onRemove={() => {
                  const index = proyectos.findIndex((p) => p.id === proyectoDestacado.id)
                  if (index !== -1) removeProyecto(index)
                }}
              />
            </div>
          )}

          {/* Tercera columna (2 proyectos) */}
          <div className="flex flex-col gap-6">
            {proyectosRegulares.slice(2, 4).map((proyecto) => (
              <ProyectoCard
                key={proyecto.id}
                proyecto={proyecto}
                isEditing={isEditing}
                onEdit={(field, value) => {
                  const index = proyectos.findIndex((p) => p.id === proyecto.id)
                  if (index !== -1) handleProyectoChange(index, field, value)
                }}
                onRemove={() => {
                  const index = proyectos.findIndex((p) => p.id === proyecto.id)
                  if (index !== -1) removeProyecto(index)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface ProyectoCardProps {
  proyecto: Proyecto
  featured?: boolean
  isEditing: boolean
  onEdit: (field: keyof Proyecto, value: string | boolean) => void
  onRemove: () => void
}

function ProyectoCard({ proyecto, featured = false, isEditing, onEdit, onRemove }: ProyectoCardProps) {
  return (
    <div className="relative group">
      {/* Admin Delete Button */}
      {isEditing && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
        >
          ×
        </button>
      )}

      {/* Edit Controls */}
      {isEditing && (
        <div className="absolute top-2 left-2 right-2 z-10 space-y-1">
          <input
            type="text"
            value={proyecto.title}
            onChange={(e) => onEdit("title", e.target.value)}
            className="border rounded px-2 py-1 w-full text-xs bg-white/90"
            placeholder="Título del proyecto"
          />
          <input
            type="url"
            value={proyecto.image}
            onChange={(e) => onEdit("image", e.target.value)}
            className="border rounded px-2 py-1 w-full text-xs bg-white/90"
            placeholder="URL de la imagen"
          />
          <input
            type="text"
            value={proyecto.link}
            onChange={(e) => onEdit("link", e.target.value)}
            className="border rounded px-2 py-1 w-full text-xs bg-white/90"
            placeholder="Link del proyecto"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={proyecto.featured || false}
              onChange={(e) => onEdit("featured", e.target.checked)}
              className="w-3 h-3"
            />
            <span className="text-xs text-white bg-black/50 px-1 rounded">Destacado</span>
          </div>
        </div>
      )}

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

      {/* Edit Description */}
      {isEditing && (
        <div className="mt-2">
          <textarea
            value={proyecto.description || ""}
            onChange={(e) => onEdit("description", e.target.value)}
            className="border rounded px-2 py-1 w-full text-xs h-16 resize-none"
            placeholder="Descripción del proyecto"
          />
        </div>
      )}
    </div>
  )
}
