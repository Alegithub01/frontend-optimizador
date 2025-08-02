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

  const renderTitleSplit = (name: string) => {
    const words = name.split(" ")
    const first = words.slice(0, -1).join(" ") || words[0]
    const last = words.length > 1 ? words[words.length - 1] : ""
    return (
      <>
        <span className="block font-medium">{first}</span>
        {last && <span className="block font-black">{last}</span>}
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-orange-500 mb-4 text-center">Optikids</h1>
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-12 text-center tracking-wide">ELIGE TU PAÍS</h2>

      {error ? (
        <p className="text-red-500 text-lg">{error}</p>
      ) : optikidsList.length === 0 ? (
        <p className="text-gray-600 text-lg">No hay Optikids disponibles en este momento.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-7xl">
          {optikidsList.map((optikids) => (
            <div key={optikids.id} className="w-full">
              {/* Imagen fuera del Card en mobile */}
              <div className="flex justify-center mb-0 md:hidden">
                <div className="w-[200px] h-[200px] relative">
                  <Image
                    src={optikids.portada1 || "/placeholder.svg"}
                    alt={`Optikids ${optikids.name}`}
                    fill
                    className="object-contain scale-125"
                    priority
                  />
                </div>
              </div>

              {/* Card - responsive diseño */}
              <Card className="relative rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full mx-auto bg-white overflow-visible flex flex-col md:flex-row items-start">
                {/* Imagen dentro del Card solo en desktop */}
                <div className="hidden md:flex justify-center items-center md:w-[300px] md:h-[300px] relative z-40">
                  <div className="w-[280px] h-[280px] lg:w-[300px] lg:h-[300px] relative">
                    <Image
                      src={optikids.portada1 || "/placeholder.svg"}
                      alt={`Optikids ${optikids.name}`}
                      fill
                      className="object-contain scale-125"
                      priority
                    />
                  </div>
                </div>

                {/* Contenido textual */}
                <div className="relative z-20 px-5 py-6 flex flex-col items-start text-left md:items-start md:text-left md:justify-center w-full">
                  <div className="flex w-full justify-between items-center gap-2 mb-2">
                    <div className="text-xl md:text-2xl text-black">
                      {renderTitleSplit(optikids.name)}
                    </div>
                    <ReactWorldFlags code={optikids.bandera} style={{ width: 28, height: 20 }} />
                  </div>

                  <p className="text-gray-7 text-sm md:text-base mb-4">{optikids.descripcion1}</p>

                  <Link href={`/optikids/${optikids.id}/`} passHref>
                    <Button className="bg-black text-white px-6 py-2 rounded-full text-sm md:text-base font-bold hover:bg-gray-800 transition-colors duration-300 w-fit flex items-center gap-2">
                      {getTranslation(optikids.bandera, "enter")}
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
