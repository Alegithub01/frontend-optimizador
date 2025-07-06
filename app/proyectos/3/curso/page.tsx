"use client"

import Image from "next/image"
import { Calendar, Clock, MapPin, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import VimeoPlayer from "@/components/VimeoPlayer"

interface CursoContent {
  heroTitle: string;
  heroDescription: string;
  videoId: string;
  videoHash: string;
  courseDate: string;
  courseTime: string;
  courseAges: string;
  courseLocation: string;
  whatsappUrl: string;
  learningTitle: string;
  learningItems: string[];
  icon1Title: string;
  icon2Title: string;
  icon3Title: string;
  icon1Image: string;
  icon2Image: string;
  icon3Image: string;
}

export default function CursoOptikidsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)

  const [content, setContent] = useState<CursoContent>({
    heroTitle: "Escuela financiera Optikids",
    heroDescription: "...",
    videoId: "1091240808",
    videoHash: "48499695cd",
    courseDate: "LUNES 29 DE MARZO, 2025",
    courseTime: "12:00 PM - 03:00PM",
    courseAges: "Poner edades",
    courseLocation: "...",
    whatsappUrl: "...",
    learningTitle: "...",
    learningItems: ["..."],
    icon1Title: "icono1",
    icon2Title: "icono2",
    icon3Title: "icono3",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    const savedContent = localStorage.getItem("cursoOptikidsContent")
    if (savedContent) {
      try {
        setContent(JSON.parse(savedContent))
      } catch (error) {
        console.error("Error cargando contenido del curso:", error)
      }
    }
  }, [])

  const handleSave = () => {
    try {
      localStorage.setItem("cursoOptikidsContent", JSON.stringify(content))
      setIsEditing(false)
      alert("Contenido guardado exitosamente!")
    } catch (error) {
      console.error("Error guardando contenido del curso:", error)
      alert("Error al guardar el contenido")
    }
  }

  const handleInputChange = <K extends keyof CursoContent>(field: K, value: CursoContent[K]) => {
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleLearningItemChange = (index: number, value: string) => {
    const newItems = [...content.learningItems]
    newItems[index] = value
    setContent((prev) => ({
      ...prev,
      learningItems: newItems,
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Panel Admin */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-xl rounded-lg p-4 border-2 border-blue-200">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500 text-center">
              👤 {user?.name} ({user?.role?.toUpperCase()})
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                  isEditing ? "bg-red-500 text-white hover:bg-red-600" : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isEditing ? "❌ Cancelar" : "✏️ Editar"}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  💾 Guardar
                </button>
              )}
            </div>
            <div className="text-xs text-center">
              Estado: {isEditing ? "🟢 Editando" : "🔴 Solo lectura"}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Video Hero */}
            <div className="relative mb-8">
              {isEditing ? (
                <div className="aspect-video bg-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 p-4">
                  <input
                    type="text"
                    placeholder="ID del video de Vimeo"
                    value={content.videoId}
                    onChange={(e) => handleInputChange("videoId", e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Solo pega el ID de Vimeo, el hash ya no es necesario.
                  </p>
                </div>
              ) : (
                <VimeoPlayer videoUrl={`https://vimeo.com/${content.videoId}`} title="Video del curso" />
              )}
            </div>

            {/* Título y descripción */}
            <div className="mb-8">
              {isEditing ? (
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                  className="text-3xl font-black text-gray-900 mb-4 border rounded px-2 py-1 w-full"
                />
              ) : (
                <h1 className="text-3xl font-black text-gray-900 mb-4">{content.heroTitle}</h1>
              )}
              {isEditing ? (
                <textarea
                  value={content.heroDescription}
                  onChange={(e) => handleInputChange("heroDescription", e.target.value)}
                  className="text-gray-600 leading-relaxed border rounded px-2 py-1 w-full h-20 resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">{content.heroDescription}</p>
              )}
            </div>

            {/* Lo que aprenderás */}
            <div className="mb-8">
              {isEditing ? (
                <input
                  type="text"
                  value={content.learningTitle}
                  onChange={(e) => handleInputChange("learningTitle", e.target.value)}
                  className="text-xl font-bold text-gray-900 mb-6 border rounded px-2 py-1 w-full"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900 mb-6">{content.learningTitle}</h2>
              )}
              <div className="space-y-4">
                {content.learningItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleLearningItemChange(index, e.target.value)}
                        className="text-gray-700 border rounded px-2 py-1 flex-1"
                      />
                    ) : (
                      <span className="text-gray-700">{item}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Íconos */}
            <div className="grid grid-cols-3 gap-8 text-center">
              {[1, 2, 3].map((i) => (
                <div key={i}>
                  {isEditing && (
                    <input
                      type="url"
                      value={content[`icon${i}Image` as keyof CursoContent] as string}
                      onChange={(e) => handleInputChange(`icon${i}Image` as keyof CursoContent, e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs mb-2"
                      placeholder={`URL Cloudinary Icono ${i}`}
                    />
                  )}
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image
                      src={(content[`icon${i}Image` as keyof CursoContent] as string) || "/placeholder.svg"}
                      alt={`Icono ${i}`}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={content[`icon${i}Title` as keyof CursoContent] as string}
                      onChange={(e) => handleInputChange(`icon${i}Title` as keyof CursoContent, e.target.value)}
                      className="text-gray-600 text-sm border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="text-gray-600 text-sm">{content[`icon${i}Title` as keyof CursoContent]}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-2xl p-6 sticky top-8 space-y-6">
              {[{ icon: <Calendar className="w-5 h-5" />, label: "Fecha", value: "courseDate" },
                { icon: <Clock className="w-5 h-5" />, label: "Hora", value: "courseTime" }].map(({ icon, label, value }) => (
                <div key={value}>
                  <div className="flex items-center gap-2 text-orange-500 mb-2">
                    {icon}
                    <span className="font-semibold">{label}</span>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={content[value as keyof CursoContent] as string}
                      onChange={(e) => handleInputChange(value as keyof CursoContent, e.target.value)}
                      className="font-bold text-gray-900 border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    <p className="font-bold text-gray-900">{content[value as keyof CursoContent]}</p>
                  )}
                </div>
              ))}

              {isEditing ? (
                <input
                  type="text"
                  value={content.courseAges}
                  onChange={(e) => handleInputChange("courseAges", e.target.value)}
                  className="text-gray-600 mt-1 border rounded px-2 py-1 w-full"
                />
              ) : (
                <p className="text-gray-600">{content.courseAges}</p>
              )}

              <div>
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-semibold">Ubicación</span>
                </div>
                {isEditing ? (
                  <textarea
                    value={content.courseLocation}
                    onChange={(e) => handleInputChange("courseLocation", e.target.value)}
                    className="text-gray-900 border rounded px-2 py-1 w-full h-16 resize-none"
                  />
                ) : (
                  <p className="text-gray-900">{content.courseLocation}</p>
                )}
              </div>

              {isEditing && (
                <input
                  type="url"
                  value={content.whatsappUrl}
                  onChange={(e) => handleInputChange("whatsappUrl", e.target.value)}
                  className="border rounded px-2 py-1 w-full text-sm"
                  placeholder="URL de WhatsApp"
                />
              )}

              <a
                href={content.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                Comprar
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-..." />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
