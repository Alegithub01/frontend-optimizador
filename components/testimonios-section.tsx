"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import VimeoPlayer from "./VimeoPlayer"
import { testimonialsData, type Testimonial } from "@/data/testimonials"
import Link from "next/link"
import Image from "next/image"

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(testimonialsData)

  useEffect(() => {
    // Cargar testimonios editados desde localStorage si existen
    const savedTestimonials = localStorage.getItem("testimonialsData")
    if (savedTestimonials) {
      try {
        const parsedTestimonials = JSON.parse(savedTestimonials)
        setTestimonials(parsedTestimonials)
      } catch (error) {
        console.error("Error parsing saved testimonials:", error)
        setTestimonials(testimonialsData)
      }
    }

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "testimonialsData" && e.newValue) {
        try {
          const updatedTestimonials = JSON.parse(e.newValue)
          setTestimonials(updatedTestimonials)
        } catch (error) {
          console.error("Error parsing updated testimonials:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleSlideChange = (index: number) => {
    if (index < 0) {
      setActiveIndex(testimonials.length - 1)
    } else if (index >= testimonials.length) {
      setActiveIndex(0)
    } else {
      setActiveIndex(index)
    }
    setPlayingVideo(null) // Stop any playing video when changing slides
  }

  const handlePlayVideo = (testimonialId: string, videoUrl: string) => {
    if (videoUrl && videoUrl.trim() !== "") {
      // Solo reproducir este video específico
      setPlayingVideo(testimonialId)
    }
  }

  const handleStopVideo = () => {
    setPlayingVideo(null)
  }

  const getVisibleTestimonials = () => {
    const result = []
    const prevIndex = activeIndex === 0 ? testimonials.length - 1 : activeIndex - 1
    result.push(testimonials[prevIndex])
    result.push(testimonials[activeIndex])
    const nextIndex = activeIndex === testimonials.length - 1 ? 0 : activeIndex + 1
    result.push(testimonials[nextIndex])
    return result
  }

  const visibleTestimonials = getVisibleTestimonials()

  return (
    <section className="container mx-auto py-12 md:py-20 px-4">
      <div className="flex flex-col items-center justify-center mb-8 md:mb-12 text-center">
        <div className="text-center">
          <h2 className="text-lg font-medium text-orange-500 mb-3">Categoría</h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">TESTIMONIOS</h3>
        </div>
      </div>

      {/* Mobile Layout - Single testimonial */}
      <div className="block md:hidden mb-8">
        <div className="relative">
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
            {/* Logo en esquina superior izquierda */}
            <div className="absolute top-4 left-4 z-10">
              <Image
                src={testimonials[activeIndex]?.logoImage || "/placeholder.svg?height=24&width=24"}
                alt="Logo"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>

            <div className="relative h-[500px]">
              {playingVideo === testimonials[activeIndex]?.id && testimonials[activeIndex]?.videoUrl ? (
                <div className="relative w-full h-full">
                  <button
                    onClick={handleStopVideo}
                    className="absolute top-4 right-4 z-20 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ✕
                  </button>
                  <VimeoPlayer videoUrl={testimonials[activeIndex].videoUrl} />
                </div>
              ) : (
                <>
                  <Image
                    src={testimonials[activeIndex]?.coverImage || "/placeholder.svg?height=500&width=400"}
                    alt={testimonials[activeIndex]?.name || "Testimonio"}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                    <button
                      onClick={() =>
                        handlePlayVideo(testimonials[activeIndex]?.id || "", testimonials[activeIndex]?.videoUrl || "")
                      }
                      className="bg-white/80 rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                      aria-label="Reproducir testimonio"
                      disabled={!testimonials[activeIndex]?.videoUrl}
                    >
                      <Play className="h-6 w-6 text-gray-800 fill-gray-800 ml-1" />
                    </button>
                  </div>
                </>
              )}

              <div className="absolute bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl">
                <Link href={`/testimonios/${testimonials[activeIndex]?.id || ""}`}>
                  <div className="flex items-center gap-3 hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <Image
                        src={testimonials[activeIndex]?.avatarImage || "/placeholder.svg?height=40&width=40"}
                        alt={testimonials[activeIndex]?.name || "Avatar"}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">
                        {testimonials[activeIndex]?.name || "Nombre no disponible"}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {testimonials[activeIndex]?.description || "Descripción no disponible"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Buttons */}
          <button
            onClick={() => handleSlideChange(activeIndex - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
            aria-label="Testimonio anterior"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <button
            onClick={() => handleSlideChange(activeIndex + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full p-2 shadow-md hover:bg-white transition-colors"
            aria-label="Siguiente testimonio"
          >
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Desktop Layout - Three testimonials */}
      <div className="hidden md:block relative mb-12">
        <button
          onClick={() => handleSlideChange(activeIndex - 1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors -ml-4"
          aria-label="Testimonio anterior"
        >
          <ChevronLeft className="h-6 w-6 text-gray-500" />
        </button>

        <div className="flex justify-center items-center gap-4 md:gap-6">
          {visibleTestimonials.map((testimonial, index) => (
            <div
              key={testimonial?.id || index}
              className={`relative transition-all duration-300 rounded-2xl overflow-hidden ${
                index === 1 ? "z-10 scale-110 shadow-xl" : "scale-90 opacity-80"
              }`}
            >
              {/* Logo en todos los testimonios */}
              <div className="absolute top-4 left-4 z-10">
                <Image
                  src={testimonial?.logoImage || "/placeholder.svg?height=24&width=24"}
                  alt="Logo"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>

              <div className="relative h-[500px] md:h-[600px] w-[280px] md:w-[350px]">
                {playingVideo === testimonial?.id && testimonial?.videoUrl ? (
                  <div className="relative w-full h-full">
                    <button
                      onClick={handleStopVideo}
                      className="absolute top-4 right-4 z-20 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      ✕
                    </button>
                    <VimeoPlayer videoUrl={testimonial.videoUrl} />
                  </div>
                ) : (
                  <>
                    <Image
                      src={testimonial?.coverImage || "/placeholder.svg?height=600&width=350"}
                      alt={testimonial?.name || "Testimonio"}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/20 transition-colors">
                      <button
                        onClick={() => handlePlayVideo(testimonial?.id || "", testimonial?.videoUrl || "")}
                        className="bg-white/80 rounded-full p-3 hover:bg-white transition-colors shadow-lg"
                        aria-label="Reproducir testimonio"
                        disabled={!testimonial?.videoUrl}
                      >
                        <Play className="h-6 w-6 text-gray-800 fill-gray-800 ml-1" />
                      </button>
                    </div>
                  </>
                )}

                <div className="absolute bottom-0 left-0 right-0 bg-white p-3 rounded-t-xl">
                  <Link href={`/testimonios/${testimonial?.id || ""}`}>
                    <div className="flex items-center gap-2 hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <Image
                          src={testimonial?.avatarImage || "/placeholder.svg?height=32&width=32"}
                          alt={testimonial?.name || "Avatar"}
                          width={32}
                          height={32}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-sm">
                          {testimonial?.name || "Nombre no disponible"}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {testimonial?.description || "Descripción no disponible"}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => handleSlideChange(activeIndex + 1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors -mr-4"
          aria-label="Siguiente testimonio"
        >
          <ChevronRight className="h-6 w-6 text-gray-500" />
        </button>
      </div>

      {/* Indicadores de navegación */}
      <div className="flex justify-center gap-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === activeIndex ? "bg-gray-800 w-4" : "bg-gray-300"
            }`}
            aria-label={`Ir al testimonio ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
