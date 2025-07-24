"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"

const SidebarCurso = () => {
  const [openSection, setOpenSection] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    setOpenSection(openSection === index ? null : index)
  }

  return (
    <aside className="w-[30%] h-screen bg-white border-r p-4 overflow-y-auto shadow-lg">
      {/* Título general del curso */}
      <h2 className="text-2xl font-bold text-center mb-6">Módulos</h2>

      {/* Lista de secciones (maquetadas sin datos aún) */}
      {[1, 2, 3].map((_, index) => (
        <div key={index} className="mb-4 border rounded-lg overflow-hidden">
          {/* Header de sección */}
          <button
            className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 hover:bg-gray-200 transition"
            onClick={() => handleToggle(index)}
          >
            <span className="text-left font-medium text-sm">
              Título de la sección {index + 1}
            </span>
            {openSection === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {/* Contenido desplegable */}
          {openSection === index && (
            <div className="p-3 bg-white space-y-2 text-sm">
              <p className="text-gray-600">Descripción breve de la sección.</p>

              {/* Miniatura del video */}
              <div className="aspect-video relative w-full rounded-md overflow-hidden border">
                <Image
                  src="/placeholder-video.jpg"
                  alt="Miniatura del video"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </aside>
  )
}

export default SidebarCurso
