"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Play, FileText, ArrowLeft, ChevronDown, Calendar, Smartphone, DownloadCloud } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { api } from "@/lib/api"
import VideoPlayer from "@/components/video-player"
import { IconRight } from "react-day-picker"

interface Content {
  id: number
  title: string
  type: "video" | "pdf" | "text"
  urlOrText: string
  secondaryUrl?: string
}

interface Section {
  id: number
  title: string
  temario: string | null
  contents: Content[]
}

interface Course {
  id: number
  title: string
  description: string
  price: string
  discount: string
  image: string
  sections: Section[]
  trailer: string | null
}

export default function CoursePlayerPage() {
  const params = useParams()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeSection, setActiveSection] = useState<Section | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set())
  const [activeVideoId, setActiveVideoId] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<"modulos" | "recursos">("modulos")
  const [expandedResources, setExpandedResources] = useState<Set<number>>(new Set())

  // Fetch course data from your backend
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        const courseData = await api.get<Course>(`/courses/${courseId}`)
        
        // Ordenar secciones por ID ascendente (más antiguo primero)
        const sortedSections = [...courseData.sections].sort((a, b) => a.id - b.id)
        
        setCourse({
          ...courseData,
          sections: sortedSections
        })

        if (sortedSections.length > 0) {
          setActiveSection(sortedSections[0])
          setExpandedSections(new Set([sortedSections[0].id]))

          const firstVideo = sortedSections[0].contents.find((content) => content.type === "video")
          if (firstVideo) {
            setActiveVideoId(firstVideo.id)
          }
        }
      } catch (error: any) {
        console.error("Error fetching course data:", error)
        setError("Error al cargar el curso")
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseData()
    }
  }, [courseId])

  const selectSection = (section: Section) => {
    setActiveSection(section)
    const firstVideo = section.contents.find((content) => content.type === "video")
    if (firstVideo) {
      setActiveVideoId(firstVideo.id)
    } else {
      setActiveVideoId(null)
    }
  }

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const toggleResource = (sectionId: number) => {
    const newExpanded = new Set(expandedResources)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedResources(newExpanded)
  }

  const playVideo = (videoId: number) => {
    setActiveVideoId(videoId)
  }

  const getVideoThumbnail = (url: string) => {
    if (url.includes("vimeo")) {
      let vimeoId = ""
      if (url.includes("vimeo.com/")) {
        vimeoId = url.split("vimeo.com/")[1].split("?")[0].split("/")[0]
      } else if (url.includes("player.vimeo.com/video/")) {
        vimeoId = url.split("player.vimeo.com/video/")[1].split("?")[0]
      }
      return `https://vumbnail.com/${vimeoId}.jpg`
    } else if (url.includes("youtube") || url.includes("youtu.be")) {
      let videoId = ""
      if (url.includes("youtube.com/watch")) {
        videoId = url.split("v=")[1]?.split("&")[0]
      } else if (url.includes("youtu.be/")) {
        videoId = url.split("/").pop()?.split("?")[0] || ""
      }
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
    return "/placeholder.svg?height=48&width=64"
  }

  const getSecondaryContentType = (url: string) => {
    if (url.includes("drive.google.com") && url.includes("/file/d/")) {
      return "pdf"
    } else if (url.includes("vimeo") || url.includes("youtube") || url.includes("youtu.be")) {
      return "video"
    } else {
      return "image"
    }
  }

  const convertDriveUrl = (url: string) => {
    if (url.includes("drive.google.com/file/d/")) {
      const fileId = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/)?.[1]
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`
      }
    }
    return url
  }

  const parseTemario = (temario: string | null) => {
    if (!temario) return []
    try {
      // Remove brackets and split by comma
      const cleaned = temario.replace(/[[\]]/g, "").trim()
      return cleaned
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
    } catch {
      return []
    }
  }

  const SecondaryContent = ({ content }: { content: Content }) => {
    if (!content.secondaryUrl) return null

    const contentType = getSecondaryContentType(content.secondaryUrl)

    return (
      <div className="mt-6 bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="text-sm font-medium text-gray-600">Recursos del curso</h3>
        </div>

        <div className="p-6">
          {contentType === "pdf" && (
            <div className="w-full h-[600px] lg:h-[800px] border rounded-lg overflow-hidden">
              <iframe
                src={convertDriveUrl(content.secondaryUrl)}
                className="w-full h-full"
                frameBorder="0"
                title="PDF Resource"
              />
            </div>
          )}

          {contentType === "video" && (
            <div className="w-full">
              <VideoPlayer
                videoUrl={content.secondaryUrl}
                title={`${content.title} - Recurso adicional`}
              />
            </div>
          )}

          {contentType === "image" && (
            <div className="w-full flex justify-center">
              <img
                src={content.secondaryUrl || "/placeholder.svg"}
                alt={`${content.title} - Recurso adicional`}
                className="max-w-full h-auto rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg?height=400&width=600"
                }}
              />
            </div>
          )}

          {/* Botón Ingresar a OptiKids (solo para Escuela financiera) */}
                    {course?.title?.trim().toLowerCase() === "escuela financiera" && (
                    <div className="flex flex-col items-center justify-center text-center space-y-6 px-4 py-8">
                      <div>
                        <h2 className="text-sm text-gray-500 font-semibold mb-1">Usa otro dispositivo</h2>
                        <p className="text-gray-600 text-sm max-w-xs mx-auto">
                          Ingresa al sitio web para poder descargar las aplicaciones y experimentar la experiencia de realidad aumentada
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
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error || "Curso no encontrado"}</div>
          <Link
            href="/cursos"
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Volver a cursos
          </Link>
        </div>
      </div>
    )
  }

  // Get active video
  const activeVideo =
    course.sections
      .flatMap((section) => section.contents)
      .find((content) => content.id === activeVideoId && content.type === "video") || null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/cursos"
              className="flex items-center gap-2 text-gray-600 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Volver a cursos</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{course.title}</h1>
          </div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Módulos</h2>
                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">
                      {course.sections.length} Cursos
                    </span>
                  </div>
                </div>

                <div className="max-h-[600px] overflow-y-auto">
                  {/* Secciones ya están ordenadas por ID ascendente */}
                  {course.sections.map((section) => {
                    const firstVideo = section.contents.find((content) => content.type === "video")
                    const thumbnail = firstVideo ? getVideoThumbnail(firstVideo.urlOrText) : "/placeholder.svg"
                    const temarioItems = parseTemario(section.temario)
                    const isExpanded = expandedSections.has(section.id)

                    return (
                      <div key={section.id} className="border-b last:border-b-0">
                        <div
                          className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                            activeSection?.id === section.id ? "bg-orange-50 border-r-4 border-orange-500" : ""
                          }`}
                          onClick={() => selectSection(section)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-16 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                                <Image
                                  src={thumbnail || "/placeholder.svg"}
                                  alt={section.title}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg?height=48&width=64"
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="h-3 w-3 text-gray-500" />
                                <span className="text-xs font-medium text-gray-600">{section.title}</span>
                              </div>
                              <h4 className="font-medium text-gray-800 text-sm leading-tight mb-2">
                                {firstVideo?.title || "Sin contenido"}
                              </h4>
                              {activeSection?.id === section.id && (
                                <div className="flex items-center">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Temario expandible */}
                        {temarioItems.length > 0 && (
                          <div className="px-4 pb-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleSection(section.id)
                              }}
                              className="flex items-center justify-between w-full text-left text-xs text-gray-600 hover:text-gray-800 transition-colors"
                            >
                              <span>Texto de referencia {section.title}</span>
                              <ChevronDown
                                className={`h-3 w-3 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}
                              />
                            </button>

                            {isExpanded && (
                              <div className="mt-2 pl-4 space-y-1">
                                {temarioItems.map((item, index) => (
                                  <div key={index} className="text-xs text-gray-600">
                                    • {item}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {activeVideo ? (
                <div className="space-y-6">
                  {/* Course Title */}
                  <div className="text-right">
                    <h1 className="text-2xl font-bold text-gray-800">{course.title}</h1>
                  </div>

                  {/* Video Player Component */}
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <VideoPlayer
                      videoUrl={activeVideo.urlOrText}
                      title={activeVideo.title}
                    />
                  </div>

                  {/* Video Info */}
                  <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">{activeSection?.title}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">{activeVideo.title}</h2>
                  </div>

                  {/* Secondary Content */}
                  <SecondaryContent content={activeVideo} />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Selecciona un módulo para comenzar</h3>
                      <p className="text-gray-500">Elige un módulo del menú lateral para empezar a aprender</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - New Design */}
      <div className="lg:hidden">
        {/* Back Button */}
        <div className="p-4">
          <Link href="/cursos" className="flex items-center gap-2 text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        {/* Video Player Mobile */}
        <div className="relative w-full aspect-video bg-black">
          {activeVideo && (
            <VideoPlayer
              videoUrl={activeVideo.urlOrText}
              title={activeVideo.title}
            />
          )}
          {!activeVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="h-16 w-16 text-white opacity-70" />
            </div>
          )}
        </div>

        {/* Course Badge and Title */}
        <div className="p-4">
          <span className="inline-block px-3 py-1 bg-orange-500 text-white text-xs rounded-full mb-2">
            {course.sections.length} Cursos
          </span>
          <h1 className="text-xl font-bold text-gray-800">{course.title}</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "modulos"
                ? "text-gray-800 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("modulos")}
          >
            Módulos
          </button>
          <button
            className={`flex-1 py-3 text-center font-medium ${
              activeTab === "recursos"
                ? "text-gray-800 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("recursos")}
          >
            Recursos
          </button>
        </div>

        {/* Módulos Tab Content */}
        {activeTab === "modulos" && (
          <div className="p-4 space-y-4">
            {/* Secciones ya están ordenadas por ID ascendente */}
            {course.sections.map((section) => {
              const firstVideo = section.contents.find((content) => content.type === "video")
              const thumbnail = firstVideo ? getVideoThumbnail(firstVideo.urlOrText) : "/placeholder.svg"
              const temarioItems = parseTemario(section.temario)
              const isExpanded = expandedSections.has(section.id)
              const isActive = activeSection?.id === section.id

              return (
                <div key={section.id} className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 relative">
                      <div className="w-20 h-16 bg-gray-200 rounded-lg overflow-hidden">
                        <Image
                          src={thumbnail || "/placeholder.svg"}
                          alt={section.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=64&width=80"
                          }}
                        />
                        {isActive && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="h-6 w-6 text-white" fill="currentColor" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600">Día {section.id}</span>
                      </div>
                      <button
                        className="text-sm font-medium text-gray-800 text-left"
                        onClick={() => selectSection(section)}
                      >
                        {firstVideo?.title || "¿Qué es una empresa?"}
                      </button>
                      {isActive && <div className="w-2 h-2 bg-orange-500 rounded-full mt-1"></div>}
                    </div>
                  </div>

                  {/* Temario expandible */}
                  {temarioItems.length > 0 && (
                    <div className="bg-gray-100 rounded-lg">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center justify-between w-full p-3 text-left text-sm text-gray-600"
                      >
                        <span>Texto de referencia{section.title}</span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-3 pt-0 space-y-1">
                          {temarioItems.map((item, index) => (
                            <div key={index} className="text-xs text-gray-600">
                              • {item}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Recursos Tab Content */}
        {activeTab === "recursos" && (
          <div className="p-4 space-y-4">
            {/* Secciones ya están ordenadas por ID ascendente */}
            {course.sections.map((section) => {
              const firstVideo = section.contents.find((content) => content.type === "video")
              if (!firstVideo || !firstVideo.secondaryUrl) return null

              const isExpanded = expandedResources.has(section.id)
              const contentType = getSecondaryContentType(firstVideo.secondaryUrl)

              return (
                <div key={`resource-${section.id}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600">Día {section.id}</span>
                      </div>
                      <h3 className="text-sm font-medium text-gray-800">{firstVideo.title}</h3>
                    </div>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>

                  {/* Recursos expandible */}
                  <div className="bg-gray-100 rounded-lg">
                    <button
                      onClick={() => toggleResource(section.id)}
                      className="flex items-center justify-between w-full p-3 text-left text-sm text-gray-600"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>Recursos</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${isExpanded ? "transform rotate-180" : ""}`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-0 space-y-4">
                        {contentType === "pdf" && (
                          <div className="w-full h-[400px] border rounded-lg overflow-hidden bg-white">
                            <iframe
                              src={convertDriveUrl(firstVideo.secondaryUrl)}
                              className="w-full h-full"
                              frameBorder="0"
                              title="PDF Resource"
                            />
                          </div>
                        )}

                        {contentType === "video" && (
                          <div className="w-full">
                            <VideoPlayer
                              videoUrl={firstVideo.secondaryUrl}
                              title={`${firstVideo.title} - Recurso adicional`}
                              />
                          </div>
                        )}

                        {contentType === "image" && (
                          <div className="w-full flex justify-center">
                            <img
                              src={firstVideo.secondaryUrl || "/placeholder.svg"}
                              alt={`${firstVideo.title} - Recurso adicional`}
                              className="max-w-full h-auto rounded-lg"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                              }}
                            />
                          </div>
                        )}

                        {/* Botón Ingresar a OptiKids (solo para Escuela financiera) */}
                        {course.title.trim() === "Escuela financiera" && (
                          <div className="text-center">
                            <a
                              href="https://sanatoriumbusiness.com/optikids/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-700 transition-colors"
                            >
                              Ingresar a OptiKids
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}