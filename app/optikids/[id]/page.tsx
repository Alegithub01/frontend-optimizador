"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import { getTranslation } from "@/lib/translations"

type Optikids = {
  id: number
  name: string
  descripcion1: string
  descripcion2: string
  portada1: string | null
  portada2?: string | null
  videoTutorialUrl?: string | null
  bandera: string
  lessons: any[]
}

export default function OptikidsDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [optikids, setOptikids] = useState<Optikids | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOptikids = async () => {
      try {
        setLoading(true)
        const data = await api.get<Optikids>(`/optikids/${id}`)
        setOptikids(data)
      } catch (err: any) {
        setError(err.message || "Error cargando Optikids")
      } finally {
        setLoading(false)
      }
    }
    fetchOptikids()
  }, [id])

  if (loading) return <p className="text-center mt-10">Cargando...</p>
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>
  if (!optikids) return <p className="text-center mt-10">Optikids no encontrado</p>

  const lang = optikids.bandera || "ES"

  return (
    <div className="min-h-screen flex flex-col bg-skyblue-0 overflow-x-hidden px-0 pt-32 md:pt-6 gap-2">
      {/* Imagen de letras */}
      <div className="mt-4">
        <Image src="/optikids/OptikidsLetra.png" alt="Optikids Logo" width={400} height={200} className="mx-auto" />
      </div>

      {/* Descripción */}
      <p className="text-white text-center font-bold max-w-xl mx-auto px-4">{optikids.descripcion2}</p>

      {/* Portada1 con pasto al frente */}
      {optikids.portada1 && (
        <div className="w-full relative z-10 max-w-6xl mx-auto">
          <div className="w-full max-w-md mx-auto">
            <Image
              src={optikids.portada1 || "/placeholder.svg"}
              alt={`Portada de ${optikids.name}`}
              width={1200}
              height={600}
              className="w-full h-auto object-contain"
              priority
            />

            {/* Pasto al frente */}
            <div className="absolute bottom-[-50px] left-0 w-full h-32 z-10 pointer-events-none">
              <Image src="/optikids/image-grass.png" alt="Decoración de pasto frontal" fill className="object-cover" />
            </div>
          </div>
        </div>
      )}

      {/* Fondo verde con botones */}
      <div className="w-full flex-grow flex flex-col justify-start md:justify-center bg-green-0 shadow-lg relative -mt-6 z-0 px-6 py-12 md:p-20">
        <div className="max-w-md mx-auto w-full flex flex-col gap-2 items-center">
          <Button
            className="bg-orange-700 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full"
            onClick={() => alert("¡Vamos!")}
          >
            {getTranslation(lang, "lets_go")}
          </Button>
          <Button
            variant="outline"
            className="shadow-lg bg-red-0 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full"
            onClick={() => {
              if (optikids.videoTutorialUrl) {
                window.open(optikids.videoTutorialUrl, "_blank")
              } else {
                alert("No hay video tutorial disponible.")
              }
            }}
          >
            {getTranslation(lang, "video_tutorial")}
          </Button>
        </div>
      </div>
    </div>
  )
}
