"use client"

import Image from "next/image"
import { Calendar, Clock, MapPin, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import VimeoPlayer from "@/components/VimeoPlayer"

export default function CursoOptikidsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState({
    heroTitle: "Escuela financiera Optikids",
    heroDescription:
      "Curso diseñado para empresario y futuros empresarios que quieren iniciar en el mundo de los negocios",
    videoId: "1091240808",
    videoHash: "48499695cd",
    courseDate: "LUNES 29 DE MARZO, 2025",
    courseTime: "12:00 PM - 03:00PM",
    courseAges: "Poner edades",
    courseLocation: "Av. Ramon, calle independencia Sacaba, Cochabamba 0125",
    whatsappUrl:
      "https://wa.me/1234567890?text=Hola,%20me%20interesa%20el%20curso%20de%20Escuela%20Financiera%20Optikids",
    learningTitle: "¿Qué es lo que aprenderás en este curso?",
    learningItems: [
      "¿Qué es una empresa?",
      "De que forma generar ingresos!",
      "Con que ojos las personas ven tu negocio",
      "Que tipos de negocios existen",
    ],
    icon1Title: "icono1",
    icon2Title: "icono2",
    icon3Title: "icono3",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  })

  useEffect(() => {
    // Verificar usuario admin
    const currentUser = getCurrentUser()
    console.log("Usuario actual (curso):", currentUser) // Para debug

    if (currentUser) {
      setUser(currentUser)
      const adminAccess = canAccessAdmin(currentUser.role)
      setIsAdmin(adminAccess)
      console.log("Es admin (curso):", adminAccess) // Para debug
    }

    // Cargar contenido guardado
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
      console.log("Contenido del curso guardado:", content) // Para debug
    } catch (error) {
      console.error("Error guardando contenido del curso:", error)
      alert("Error al guardar el contenido")
    }
  }

  const handleInputChange = (field: string, value: string) => {
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
      {/* Admin Controls - Mejorados */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-xl rounded-lg p-4 border-2 border-blue-200">
          <div className="flex flex-col gap-2">
            <div className="text-xs text-gray-500 text-center">
              👤 {user?.name} ({user?.role?.toUpperCase()})
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log("Botón editar presionado (curso), isEditing actual:", isEditing)
                  setIsEditing(!isEditing)
                }}
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
            <div className="text-xs text-center">Estado: {isEditing ? "🟢 Editando" : "🔴 Solo lectura"}</div>
          </div>
        </div>
      )}

      {/* Debug info - Solo visible en desarrollo */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-4 left-4 z-50 bg-black text-white p-2 rounded text-xs">
          Admin: {isAdmin ? "✅" : "❌"} | Editing: {isEditing ? "✅" : "❌"} | Page: Curso
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal - Video y contenido */}
          <div className="lg:col-span-2">
            {/* Video Hero */}
            <div className="relative mb-8">
              {isEditing ? (
                <div className="aspect-video bg-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 p-4">
                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      placeholder="ID del video de Vimeo (ej: 1091240808)"
                      value={content.videoId}
                      onChange={(e) => handleInputChange("videoId", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                    <input
                      type="text"
                      placeholder="Hash del video (ej: 48499695cd) - Opcional"
                      value={content.videoHash}
                      onChange={(e) => handleInputChange("videoHash", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Copia el ID y hash desde el código de inserción de Vimeo
                  </p>
                </div>
              ) : (
                <VimeoPlayer
                  videoId={content.videoId}
                  hash={content.videoHash}
                  title="Video del curso"
                  className="aspect-video"
                  autoplay={false}
                  showTitle={false}
                />
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

            {/* ¿Qué aprenderás? */}
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

            {/* Iconos */}
            <div className="grid grid-cols-3 gap-8 text-center">
              {/* Icono 1 */}
              <div>
                {isEditing && (
                  <input
                    type="url"
                    value={content.icon1Image}
                    onChange={(e) => handleInputChange("icon1Image", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-xs mb-2"
                    placeholder="URL Cloudinary Icono 1"
                  />
                )}
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image
                    src={content.icon1Image || "/placeholder.svg"}
                    alt="Icono 1"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={content.icon1Title}
                    onChange={(e) => handleInputChange("icon1Title", e.target.value)}
                    className="text-gray-600 text-sm border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{content.icon1Title}</p>
                )}
              </div>

              {/* Icono 2 */}
              <div>
                {isEditing && (
                  <input
                    type="url"
                    value={content.icon2Image}
                    onChange={(e) => handleInputChange("icon2Image", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-xs mb-2"
                    placeholder="URL Cloudinary Icono 2"
                  />
                )}
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image
                    src={content.icon2Image || "/placeholder.svg"}
                    alt="Icono 2"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={content.icon2Title}
                    onChange={(e) => handleInputChange("icon2Title", e.target.value)}
                    className="text-gray-600 text-sm border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{content.icon2Title}</p>
                )}
              </div>

              {/* Icono 3 */}
              <div>
                {isEditing && (
                  <input
                    type="url"
                    value={content.icon3Image}
                    onChange={(e) => handleInputChange("icon3Image", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-xs mb-2"
                    placeholder="URL Cloudinary Icono 3"
                  />
                )}
                <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Image
                    src={content.icon3Image || "/placeholder.svg"}
                    alt="Icono 3"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={content.icon3Title}
                    onChange={(e) => handleInputChange("icon3Title", e.target.value)}
                    className="text-gray-600 text-sm border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="text-gray-600 text-sm">{content.icon3Title}</p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Información del curso */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-2xl p-6 sticky top-8">
              {/* Fecha */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">Fecha</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={content.courseDate}
                    onChange={(e) => handleInputChange("courseDate", e.target.value)}
                    className="font-bold text-gray-900 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="font-bold text-gray-900">{content.courseDate}</p>
                )}
              </div>

              {/* Hora */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-orange-500 mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">Hora</span>
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={content.courseTime}
                    onChange={(e) => handleInputChange("courseTime", e.target.value)}
                    className="font-bold text-gray-900 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="font-bold text-gray-900">{content.courseTime}</p>
                )}
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
              </div>

              {/* Ubicación */}
              <div className="mb-8">
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

              {/* Botón de comprar */}
              {isEditing && (
                <div className="mb-4">
                  <input
                    type="url"
                    value={content.whatsappUrl}
                    onChange={(e) => handleInputChange("whatsappUrl", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm"
                    placeholder="URL de WhatsApp"
                  />
                </div>
              )}

              <a
                href={content.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              >
                Comprar
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
