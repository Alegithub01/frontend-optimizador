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
  Smartphone,
  DownloadCloud,
  Expand,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"
import PDFViewerSecure from "@/components/pdf-viewer-secure"
import { IconRight } from "react-day-picker"
import { X } from "lucide-react"

interface ToolkitSection {
  id: number
  title: string
  videoUrl: string | null
  description: string
  fileUrl: string | null
  downloadUrl?: string
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
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [showPDF, setShowPDF] = useState(false)

  // Estados para el video player personalizado
  const [showVideoControls, setShowVideoControls] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  const { category, id } = params

  const [showImageModal, setShowImageModal] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState("")
  const [showModal, setShowModal] = useState(false)

  const openImageModal = (url: string) => {
    setModalImageUrl(url)
    setShowImageModal(true)
  }

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

    // Determinar la etiqueta según la categoría
    const categoryLabel = product?.category === "e-kit" ? "E-Kit" : "Toolkit"

    return (
      <div className="flex-1 bg-white">
        {/* Header del toolkit/e-kit */}
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
              <div className="text-orange-500 text-sm font-medium">{categoryLabel}</div>
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

                {/* Imagen directa - solo si existe fileUrl */}
                {currentSectionData.fileUrl && (
                  <div className="w-full bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <img
                        src={currentSectionData.fileUrl || "/placeholder.svg"}
                        alt={`Imagen material de ${currentSectionData.title}`}
                        className="w-full max-w-2xl h-auto rounded-lg shadow-md cursor-zoom-in transition duration-200 hover:scale-105"
                        onClick={() => openImageModal(currentSectionData.fileUrl!)}
                      />
                    </div>
                  </div>
                )}

                {/* Botón de descarga - solo si existe downloadUrl y NO hay imagen */}
                {currentSectionData.downloadUrl && !currentSectionData.fileUrl && (
                  <div className="w-full bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                      <div className="text-gray-600 mb-4">
                        <FileText className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                        <p className="text-lg font-medium">Material descargable disponible</p>
                        <p className="text-sm text-gray-500">Descarga el archivo de esta sección</p>
                      </div>
                      <a
                        href={currentSectionData.downloadUrl}
                        download
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-base font-medium transition-all shadow-lg hover:shadow-xl"
                      >
                        <Download className="w-5 h-5" />
                        Descargar archivo
                      </a>
                    </div>
                  </div>
                )}

                {/* Botón de descarga adicional - si hay imagen Y downloadUrl */}
                {currentSectionData.downloadUrl && currentSectionData.fileUrl && (
                  <div className="w-full bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                    <div className="flex justify-center">
                      <a
                        href={currentSectionData.downloadUrl}
                        download
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-all"
                      >
                        <Download className="w-4 h-4" />
                        Descargar recurso
                      </a>
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

          {/* Botones de navegación - centrados a la altura del video */}
          <button
            onClick={goToPrevSection}
            disabled={currentSectionIndex === 0}
            className={`absolute left-4 top-[35%] transform -translate-y-1/2 rounded-full p-3 transition-all z-20 ${
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
            className={`absolute right-4 top-[35%] transform -translate-y-1/2 rounded-full p-3 transition-all z-20 ${
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
    return (
      <div className="flex-1 bg-white">
        {/* Header del libro */}
        <div className="text-center py-8 border-b">
          <h1 className="text-2xl font-bold text-gray-900">{product?.name}</h1>
          {product?.author && <p className="text-gray-600 mt-2">Por {product.author}</p>}
        </div>

        {/* Visor de PDF */}
        <div className="flex justify-center py-10">
          <div className="w-[360px] h-[510px] shadow-xl border rounded-lg overflow-hidden">
            <PDFViewerSecure src={product?.pdfUrl || ""} title={product?.name} className="w-full h-full" />
          </div>
        </div>

        {/* Botón para ampliar */}
        <div className="flex justify-center">
          <button
            onClick={() => setShowModal(true)}
            className="mt-6 px-6 py-2 text-gray-700 rounded-full font-semibold hover:bg-orange-100 transition-all text-sm"
          >
            <Expand />
          </button>
        </div>

        {/* Modal grande */}
        {showModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative w-[580px] h-[740px] bg-white rounded-lg shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-700 hover:text-red-500 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* PDF ampliado */}
              <PDFViewerSecure src={product?.pdfUrl || ""} title={product?.name} className="w-full h-full" />
            </div>
          </div>
        )}

        {/* Botón OptiKids */}
        {product?.name?.trim().toLowerCase() === "escuela financiera: optikids" && (
          <div className="flex flex-col items-center justify-center text-center space-y-6 px-4 py-8">
            <div>
              <h2 className="text-sm text-gray-500 font-semibold mb-1">Usa otro dispositivo</h2>
              <p className="text-gray-600 text-sm max-w-xs mx-auto">
                Ingresa al sitio web para poder descargar las aplicaciones y experimentar la experiencia de realidad
                aumentada
              </p>
            </div>

            {/* Botón principal */}
            <a
              href="https://sanatoriumbusiness.com/optikids/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-full text-sm transition-all duration-200"
            >
              Sitio web oficial OPTIKIDS
              <IconRight className="w-4 h-4" />
            </a>

            {/* Instrucciones */}
            <div className="text-gray-500 text-xs space-y-3 mt-2">
              <div className="flex items-center gap-2 justify-center">
                <Smartphone className="w-5 h-5 flex-shrink-0" />
                <span>Escanea los códigos QR de la hoja con otro teléfono.</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <DownloadCloud className="w-5 h-5 flex-shrink-0" />
                <span>
                  Descarga las apps y escanea las imágenes para vivir la experiencia completa en realidad aumentada.
                </span>
              </div>
            </div>
          </div>
        )}
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

  // Función para obtener el nombre de la categoría para mostrar
  const getCategoryDisplayName = (category: string) => {
    switch (category) {
      case "toolkit":
        return "Toolkit"
      case "e-kit":
        return "E-Kit"
      case "libro":
        return "Libro"
      case "revista":
        return "Revista"
      default:
        return "Producto"
    }
  }

  // Determinar si debe usar la interfaz de toolkit (para toolkit y e-kit)
  const shouldUseToolkitInterface = product.category === "toolkit" || product.category === "e-kit"

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
              <h1 className="text-lg font-semibold text-gray-900">{getCategoryDisplayName(product.category)}</h1>
              <p className="text-sm text-gray-600">{product.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Renderizar contenido según la categoría */}
      {shouldUseToolkitInterface ? renderToolkitContent() : renderBookContent()}

      {/* Modal de imagen */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl w-full mx-4">
            <img
              src={modalImageUrl || "/placeholder.svg"}
              alt="Vista previa"
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg shadow-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
