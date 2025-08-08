"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation" // Import useSearchParams
import { api } from "@/lib/api"
import VimeoPlayer from "@/components/VimeoPlayer"
import { getTranslation } from "@/lib/translations"
import Image from "next/image"
import type { Optikids, Lesson } from "@/types/optikids" // Import Lesson type

export default function OptikidsTutorialPage() {
  const { id } = useParams() as { id: string }
  const searchParams = useSearchParams() // Get search params
  const lessonId = searchParams.get("lessonId") // Get lessonId from search params

  const [optikids, setOptikids] = useState<Optikids | null>(null)
  const [lesson, setLesson] = useState<Lesson | null>(null) // State for specific lesson
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("OptikidsTutorialPage - params.id:", id) // Debugging
    console.log("OptikidsTutorialPage - lessonId from searchParams:", lessonId) // Debugging

    const fetchData = async () => {
      try {
        setLoading(true)
        // Always fetch Optikids data for footer and general context
        const optikidsData = await api.get<Optikids>(`/optikids/${id}`)
        setOptikids(optikidsData)
        console.log("OptikidsTutorialPage - Fetched Optikids data:", optikidsData) // Debugging

        if (lessonId) {
          // If lessonId is present, fetch specific lesson video
          const lessonData = await api.get<Lesson>(`/optikids/lessons/${lessonId}`)
          setLesson(lessonData)
          console.log("OptikidsTutorialPage - Fetched Lesson data:", lessonData) // Debugging
        }
      } catch (err: any) {
        console.error("OptikidsTutorialPage - Error fetching data:", err)
        setError(err.message || "No se pudo cargar el video o la información asociada.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, lessonId]) // Re-fetch if optikids ID or lesson ID changes

  const lang = optikids?.bandera || "ES"

  // Determine which video URL to use
  const videoUrlToDisplay = lessonId ? lesson?.urlVideo : optikids?.videoTutorialUrl
  // Determine the title to display
  const pageTitle = lessonId ? lesson?.titulo : getTranslation(lang, "tutorial_uso")

  if (loading) return <p className="text-center mt-10">Cargando video...</p>
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>
  if (!videoUrlToDisplay) {
    return <p className="text-center mt-10 text-red-600">{getTranslation(lang, "video_not_available")}</p>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white pt-0 pb-0 relative">
      {/* Césped superior */}
      <div
        className="w-full h-14 bg-repeat-x bg-[length:auto_100%]"
        style={{ backgroundImage: "url('/optikids/top-grass.png')" }}
      />
      {/* Título */}
      <h1 className="text-3xl md:text-3xl font-amsipronarwultra font-black mt-4 mb-6 text-center text-black">
        {pageTitle}
      </h1>
      {/* Video */}
      <div className="w-full px-4 md:px-0 h-[65vh] md:aspect-video md:max-h-[60vh]">
        <VimeoPlayer videoUrl={videoUrlToDisplay} />
      </div>
      {/* Footer completo sin espacios */}
      <div className="w-full relative mt-auto">
        {" "}
        {/* mt-auto pushes footer to bottom */}
        {/* Césped pegado justo encima del fondo verde */}
        <div className="w-full relative h-14">
          <div
            className="absolute bottom-[-10px] left-0 w-full h-14 bg-repeat-x bg-[length:auto_100%] z-0"
            style={{
              backgroundImage: "url('/optikids/footer-grass-front.png')",
            }}
          />
        </div>
        {/* Zona de contacto con fondo verde */}
        <div className="w-full relative z-10 bg-green-0 py-6 px-4 md:px-10">
          <div className="text-white font-black text-sm md:text-lg flex flex-col gap-2">
            <span className="text-xl">Contacto</span>
            {optikids?.whatsUrl && (
              <a href={optikids.whatsUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <Image src="/optikids/whatsico.svg" alt="WhatsApp" width={24} height={24} className="w-6 h-6" />
                <span>{optikids.whatsText || "WhatsApp"}</span>
              </a>
            )}
            {optikids?.snapUrl && (
              <div className="relative w-full">
                <a
                  href={optikids.snapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute md:bottom-[20px] w-full flex justify-start md:justify-center"
                >
                  <Image src="/optikids/snapico.svg" alt="Snapchat" width={24} height={24} className="w-6 h-6" />
                  <span className="ml-1">{optikids.snapText || "Snapchat"}</span>
                </a>
              </div>
            )}
          </div>
          {/* Imagen portada1 en la esquina inferior derecha */}
          {optikids?.portada1 && (
            <Image
              src={optikids.portada1 || "/placeholder.svg"}
              alt="Decoración"
              width={200}
              height={200}
              className="absolute bottom-0 right-4 object-contain z-20 w-[210px] h-auto md:w-[300px]"
            />
          )}
        </div>
      </div>
    </div>
  )
}
