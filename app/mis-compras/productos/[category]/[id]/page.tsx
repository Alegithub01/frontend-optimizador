"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import PDFViewerSecure from "@/components/pdf-viewer-secure"

interface ToolkitSection {
  id: number
  title: string
  videoUrl: string | null
  description: string
  fileUrl: string | null
  createdAt: string
}

interface Product {
  id: string
  name: string
  author?: string
  price: string
  stock: number
  image: string
  category: string
  subCategory: string
  description: string
  pdfUrl: string | null
  sections: ToolkitSection[]
  createdAt: string
  updatedAt: string
  trailerUrl: string | null
}

interface ProductViewerPageProps {
  params: {
    category: string
    id: string
  }
}

export default function ProductViewerPage({ params }: ProductViewerPageProps) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0) // Cambiado a índice en lugar de ID
  const [showPDF, setShowPDF] = useState(false)

  // Estados para el video player personalizado
  const [showVideoControls, setShowVideoControls] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  const { category, id } = params

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData = await api.get<Product>(`/product/${id}`)

        // Ordenar secciones por ID para asegurar el orden correcto
        if (productData.sections) {
          productData.sections.sort((a, b) => a.id - b.id)
        }

        setProduct(productData)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const getCurrentSectionData = () => {
    if (!product?.sections || product.sections.length === 0) return null
    return product.sections[currentSectionIndex]
  }

  const goToNextSection = () => {
    if (product?.sections && currentSectionIndex < product.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
      setShowPDF(false)
      setShowVideoControls(true)
    }
  }

  const goToPrevSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
      setShowPDF(false)
      setShowVideoControls(true)
    }
  }

  const handleDownloadPDF = () => {
    if (product?.pdfUrl) {
      window.open(product.pdfUrl, "_blank")
    }
  }

  // Función para obtener URL de embed del video
  const getVideoEmbedUrl = (url: string) => {
    if (url.includes("vimeo")) {
      let vimeoId = ""
      if (url.includes("vimeo.com/")) {
        vimeoId = url.split("vimeo.com/")[1].split("?")[0].split("/")[0]
      } else if (url.includes("player.vimeo.com/video/")) {
        vimeoId = url.split("player.vimeo.com/video/")[1].split("?")[0]
      }
      return `https://player.vimeo.com/video/${vimeoId}?autoplay=0&controls=1&responsive=1&api=1`
    } else if (url.includes("youtube") || url.includes("youtu.be")) {
      let videoId = ""
      if (url.includes("youtube.com/watch")) {
        videoId = url.split("v=")[1]?.split("&")[0]
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("/").pop()?.split("?")[0] || ""
      }
      return `https://www.youtube.com/embed/${videoId}?controls=1&rel=0&enablejsapi=1`
    }
    return url
  }

  // Controles del video personalizados
  const togglePlayPause = () => {
    if (!iframeRef.current) return

    try {
      const currentSectionData = getCurrentSectionData()
      if (currentSectionData?.videoUrl?.includes("vimeo")) {
        if (isPlaying) {
          iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', "*")
          setIsPlaying(false)
        } else {
          iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
          setIsPlaying(true)
        }
      } else if (currentSectionData?.videoUrl?.includes("youtube")) {
        if (isPlaying) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
          setIsPlaying(false)
        } else {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
          setIsPlaying(true)
        }
      }
    } catch (error) {
      console.error("Error controlling video:", error)
    }
  }

  const skipForward = () => {
    if (!iframeRef.current) return

    try {
      const currentSectionData = getCurrentSectionData()
      if (currentSectionData?.videoUrl?.includes("vimeo")) {
        const newTime = currentTime + 10
        iframeRef.current.contentWindow?.postMessage(`{"method":"setCurrentTime","value":${newTime}}`, "*")
        setCurrentTime(newTime)
      } else if (currentSectionData?.videoUrl?.includes("youtube")) {
        const newTime = currentTime + 10
        iframeRef.current.contentWindow?.postMessage(
          `{"event":"command","func":"seekTo","args":[${newTime}, true]}`,
          "*",
        )
        setCurrentTime(newTime)
      }
    } catch (error) {
      console.error("Error skipping forward:", error)
    }
  }

  const skipBackward = () => {
    if (!iframeRef.current) return

    try {
      const currentSectionData = getCurrentSectionData()
      if (currentSectionData?.videoUrl?.includes("vimeo")) {
        const newTime = Math.max(0, currentTime - 10)
        iframeRef.current.contentWindow?.postMessage(`{"method":"setCurrentTime","value":${newTime}}`, "*")
      } else if (currentSectionData?.videoUrl?.includes("youtube")) {
        const newTime = Math.max(0, currentTime - 10)
        iframeRef.current.contentWindow?.postMessage(
          `{"event":"command","func":"seekTo","args":[${newTime}, true]}`,
          "*",
        )
      }
    } catch (error) {
      console.error("Error skipping backward:", error)
    }
  }

  const restartVideo = () => {
    if (!iframeRef.current) return

    try {
      const currentSectionData = getCurrentSectionData()
      if (currentSectionData?.videoUrl?.includes("vimeo")) {
        iframeRef.current.contentWindow?.postMessage('{"method":"setCurrentTime","value":0}', "*")
        iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
        setIsPlaying(true)
      } else if (currentSectionData?.videoUrl?.includes("youtube")) {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', "*")
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
        setIsPlaying(true)
      }
      setCurrentTime(0)
    } catch (error) {
      console.error("Error restarting video:", error)
    }
  }

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Escuchar eventos del video
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com" && event.origin !== "https://www.youtube.com") return

      try {
        const data = JSON.parse(event.data)

        if (data.event === "ready" || data.method === "ready") {
          setShowVideoControls(true)
          setIsPlaying(true)
        }

        if (data.method === "timeupdate" && data.data) {
          setCurrentTime(data.data.seconds)
          setDuration(data.data.duration)
        }
      } catch (error) {
        // Ignorar errores de parsing
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  const renderToolkitContent = () => {
    const totalSections = product?.sections?.length || 0
    const currentSectionData = getCurrentSectionData()
    const isLastSection = currentSectionIndex === totalSections - 1

    return (
      <div className="flex-1 bg-white">
        {/* Header del toolkit */}
        <div className="border-b bg-gray-50">
          <div className="container mx-auto px-4 py-6">
            {/* Barra de progreso */}
            <div className="flex items-center justify-center mb-4">
              {product?.sections?.map((section, index) => (
                <div key={section.id} className="flex items-center">
                  <button
                    onClick={() => {
                      setCurrentSectionIndex(index)
                      setShowPDF(false)
                      setShowVideoControls(true)
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${
                      index === currentSectionIndex
                        ? "bg-orange-500 text-white"
                        : index < currentSectionIndex
                          ? "bg-orange-300 text-white hover:bg-orange-400"
                          : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {index + 1}
                  </button>
                  {index < totalSections - 1 && (
                    <div className={`w-12 h-1 mx-2 ${index < currentSectionIndex ? "bg-orange-500" : "bg-gray-200"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="text-center">
              <div className="text-orange-500 text-sm font-medium">Toolkit</div>
              <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
              {currentSectionData && <p className="text-gray-600 mt-2">{currentSectionData.title}</p>}

              {/* Botón OptiKids - Prominente cerca del título */}
              {product?.name?.trim().toLowerCase() === "escuela financiera: optikids" && (
                <div className="mt-4">
                  <a
                    href="https://sanatoriumbusiness.com/optikids/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    🎯 Ingresar a OptiKids
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="relative min-h-[calc(100vh-250px)] h-auto">
          {!showPDF && currentSectionData?.videoUrl ? (
            // Contenedor unificado para video e imagen
            <div className="w-full h-full p-3 sm:p-6 bg-gradient-to-b from-gray-50 to-white overflow-auto">
              <div className="max-w-6xl mx-auto flex flex-col gap-6">
                {/* Video directo - más grande y completo */}
                <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl">
                  <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                    <iframe
                      ref={iframeRef}
                      src={getVideoEmbedUrl(currentSectionData.videoUrl)}
                      className="absolute inset-0 w-full h-full"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                      allowFullScreen
                      title={currentSectionData.title}
                      onClick={() => setShowVideoControls(true)}
                    />
                  </div>
                </div>

                {/* Controles personalizados del video - DEBAJO del video */}
                {showVideoControls && (
                  <div className="w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">Controles de Video</h3>
                      <p className="text-sm text-gray-500">Controles avanzados de reproducción</p>
                    </div>

                    {/* Información del tiempo con mejor diseño */}
                    <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-lg mx-6 mt-6">
                      <div className="text-sm font-medium text-gray-700">
                        <span className="text-orange-500">{formatTime(currentTime)}</span> / {formatTime(duration)}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500" : "bg-gray-400"}`}></div>
                        {isPlaying ? "Reproduciendo" : "Pausado"}
                      </div>
                    </div>

                    {/* Botones de control con mejor estilo */}
                    <div className="flex items-center justify-center gap-3 pb-6 px-6">
                      {/* Reiniciar */}
                      <button
                        onClick={restartVideo}
                        className="p-3 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
                        title="Reiniciar video"
                      >
                        <RotateCcw className="h-5 w-5 text-gray-700" />
                      </button>

                      {/* Retroceder */}
                      <button
                        onClick={skipBackward}
                        className="p-3 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
                        title="Retroceder 10 segundos"
                      >
                        <SkipBack className="h-5 w-5 text-gray-700" />
                      </button>

                      {/* Play/Pause */}
                      <button
                        onClick={togglePlayPause}
                        className="p-4 bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-orange-300"
                        title={isPlaying ? "Pausar" : "Reproducir"}
                      >
                        {isPlaying ? (
                          <Pause className="h-6 w-6 text-white" fill="currentColor" />
                        ) : (
                          <Play className="h-6 w-6 text-white ml-1" fill="currentColor" />
                        )}
                      </button>

                      {/* Adelantar */}
                      <button
                        onClick={skipForward}
                        className="p-3 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
                        title="Adelantar 10 segundos"
                      >
                        <SkipForward className="h-5 w-5 text-gray-700" />
                      </button>

                      {/* Ocultar controles */}
                      <button
                        onClick={() => setShowVideoControls(false)}
                        className="px-4 py-2 text-sm bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
                      >
                        Ocultar
                      </button>

                      {/* Pantalla completa */}
                      <button
                        onClick={() => {
                          if (iframeRef.current && iframeRef.current.requestFullscreen) {
                            iframeRef.current.requestFullscreen()
                          }
                        }}
                        className="px-4 py-2 text-sm bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-400"
                        title="Pantalla completa"
                      >
                        Expandir
                      </button>
                    </div>
                  </div>
                )}

                {/* Botón para mostrar controles si están ocultos */}
                {!showVideoControls && (
                  <div className="w-full flex justify-center">
                    <button
                      onClick={() => setShowVideoControls(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg"
                    >
                      <Play className="h-5 w-5" />
                      Mostrar Controles de Video
                    </button>
                  </div>
                )}

                {/* Imagen directa - mantener exactamente como está */}
                {currentSectionData.fileUrl && (
                  <div className="w-full bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <img
                          src={currentSectionData.fileUrl || "/placeholder.svg"}
                          alt={`Material de ${currentSectionData.title}`}
                          className="w-24 h-18 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => window.open(currentSectionData.fileUrl!, "_blank")}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Material complementario</h4>
                        <p className="text-sm text-gray-600 mb-2">Recurso adicional para esta sección</p>
                        <button
                          onClick={() => window.open(currentSectionData.fileUrl!, "_blank")}
                          className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                        >
                          Ver en tamaño completo →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : showPDF && product?.pdfUrl ? (
            // Mostrar PDF
            <PDFViewerSecure src={product.pdfUrl} title={product.name} className="w-full h-full" />
          ) : (
            // Estado por defecto
            <div className="h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Contenido no disponible</p>
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <button
            onClick={goToPrevSection}
            disabled={currentSectionIndex === 0}
            className={`absolute left-4 top-1/2 transform -translate-y-1/2 rounded-full p-3 transition-all z-20 ${
              currentSectionIndex === 0
                ? "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                : "bg-white/90 hover:bg-white text-gray-700 hover:shadow-xl shadow-lg backdrop-blur-sm"
            }`}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={goToNextSection}
            disabled={currentSectionIndex === (product?.sections?.length || 1) - 1}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 rounded-full p-3 transition-all z-20 ${
              currentSectionIndex === (product?.sections?.length || 1) - 1
                ? "bg-gray-200/80 text-gray-400 cursor-not-allowed"
                : "bg-white/90 hover:bg-white text-gray-700 hover:shadow-xl shadow-lg backdrop-blur-sm"
            }`}
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Controles inferiores principales */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-gray-200">
              {/* Botón para ver PDF */}
              {product?.pdfUrl && (
                <button
                  onClick={() => setShowPDF(!showPDF)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    showPDF
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  {showPDF ? "Ver Video" : "Material PDF"}
                </button>
              )}

              {/* Botón de descarga */}
              {isLastSection && product?.pdfUrl && (
                <button
                  onClick={handleDownloadPDF}
                  className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all shadow-md"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </button>
              )}

              {/* Indicador de sección */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
                <span className="font-medium">{currentSectionIndex + 1}</span>
                <span>/</span>
                <span>{totalSections}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la sección actual */}
        {currentSectionData && (
          <div className="border-t bg-gray-50 p-4">
            <div className="container mx-auto">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">{currentSectionData.title}</h3>
                  <p className="text-gray-600 text-sm">{currentSectionData.description}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Sección {currentSectionIndex + 1} de {totalSections}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderBookContent = () => {
    const pdfUrl = product?.pdfUrl || "https://drive.google.com/file/d/1234567890/preview"

    return (
      <div className="flex-1 bg-white">
        {/* Header del libro */}
        <div className="text-center py-8 border-b">
          <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
          {product?.author && <p className="text-gray-600 mt-2">Por {product.author}</p>}

          {/* Botón OptiKids - Prominente cerca del título */}
          {product?.name?.trim().toLowerCase() === "escuela financiera: optikids" && (
            <div className="mt-6">
              <a
                href="https://sanatoriumbusiness.com/optikids/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                🎯 Ingresar a OptiKids
              </a>
            </div>
          )}
        </div>

        {/* Visor de PDF */}
        <div className="relative h-[calc(100vh-200px)]">
          <PDFViewerSecure src={pdfUrl} title={product?.name} className="w-full h-full" />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando contenido...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl">Producto no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link href="/mis-compras" className="text-gray-600 hover:text-gray-800 mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {product.category === "toolkit" ? "Toolkit" : product.category === "libro" ? "Libro" : "Revista"}
              </h1>
              <p className="text-sm text-gray-600">{product.name}</p>
            </div>
          </div>
        </div>
      </div>

      {product.category === "toolkit" ? renderToolkitContent() : renderBookContent()}
    </div>
  )
}
