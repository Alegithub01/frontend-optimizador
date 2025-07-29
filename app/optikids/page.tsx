"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { getTranslation } from "@/lib/translations"
import type { Optikids } from "@/types/optikids"
// @ts-ignore
import ReactWorldFlags from "react-world-flags"
import { ChevronRight } from "lucide-react"

export default function OptikidsHomePage() {
  const [optikidsList, setOptikidsList] = useState<Optikids[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptikids = async () => {
      try {
        const data = await api.get<Optikids[]>("/optikids")
        setOptikidsList(data)
      } catch (err: any) {
        console.error("Error fetching Optikids:", err)
        setError(err.message || "Error al cargar la lista de Optikids.")
      }
    }
    fetchOptikids()
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4 text-center">Optikids</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-12 text-center tracking-wide">ELIGE TU PAÍS</h2>
      {error ? (
        <p className="text-red-500 text-lg">{error}</p>
      ) : optikidsList.length === 0 ? (
        <p className="text-gray-600 text-lg">No hay Optikids disponibles en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
          {optikidsList.map((optikids) => (
            <Card
              key={optikids.id}
              className="flex items-center rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full mx-auto bg-white relative overflow-hidden"
            >
              {/* Imagen personaje - posicionada para asomarse */}
              <div className="relative w-[250px] h-[250px] md:w-[300px] md:h-[300px] shrink-0 -ml-20 -mb-20">
                <Image
                  src={optikids.portada1 || "/placeholder.svg"}
                  alt={`Optikids ${optikids.name}`}
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              {/* Contenido textual */}
              <div className="flex flex-col justify-center flex-1 p-6 pl-0">
                <div className="flex items-center gap-2 mb-2">
                  <ReactWorldFlags code={optikids.bandera} style={{ width: 28, height: 20 }} />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl text-gray-900">
                    <span className="font-bold">{optikids.name}</span>
                  </h3>
                </div>
                {/* Descripción */}
                <p className="text-gray-600 text-sm md:text-base mb-4">{optikids.descripcion1}</p>
                {/* Botón */}
                <Link href={`/optikids/${optikids.id}/detail`} passHref>
                  <Button className="bg-black text-white px-6 py-2 rounded-full text-sm md:text-base font-medium hover:bg-gray-800 transition-colors duration-300 w-fit flex items-center gap-2">
                    {getTranslation(optikids.bandera, "enter")}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
