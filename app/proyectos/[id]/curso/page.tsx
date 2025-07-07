"use client"
import Image from "next/image"
import { Calendar, Clock, MapPin, Check } from "lucide-react"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import VimeoPlayer from "@/components/VimeoPlayer"
import { useParams } from "next/navigation"
import Link from "next/link"

interface CursoContent {
  id: string
  heroTitle: string
  heroDescription: string
  videoId: string
  videoHash?: string
  courseDate: string
  courseTime: string
  courseAges: string
  courseLocation: string
  whatsappUrl: string
  learningTitle: string
  learningItems: string[]
  icon1Title: string
  icon2Title: string
  icon3Title: string
  icon1Image: string
  icon2Image: string
  icon3Image: string
}

export default function CursoPage() {
  const params = useParams()
  const proyectoId = params.id as string
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState<CursoContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    loadCursoContent()
  }, [proyectoId])

  const loadCursoContent = async () => {
    setLoading(true)
    try {
      console.log("🔍 Cargando curso para ID:", proyectoId)

      // SOLO usamos la API de prueba que funciona
      const response = await fetch("/api/test-cursos")

      if (response.ok) {
        const data = await response.json()
        console.log("📊 Datos recibidos:", data)
        console.log("🔎 Buscando ID:", proyectoId)

        const cursoContent = data.find((c: CursoContent) => c.id === proyectoId)
        console.log("✅ Curso encontrado:", cursoContent)

        if (cursoContent) {
          setContent(cursoContent)
        } else {
          console.error("❌ No se encontró curso con ID:", proyectoId)
          // Usar el primero como fallback
          if (data.length > 0) {
            console.log("🔄 Usando primer curso como fallback")
            setContent(data[0])
          }
        }
      } else {
        console.error("❌ Error en respuesta API:", response.status)
      }
    } catch (error) {
      console.error("💥 Error loading curso content:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content) return

    setSaving(true)
    try {
      // Obtener todos los cursos actuales
      const response = await fetch("/api/test-cursos")
      const allContent = await response.json()

      // Actualizar el curso específico
      const updatedContent = allContent.map((c: CursoContent) => (c.id === content.id ? content : c))

      // Guardar usando la API de prueba
      const saveResponse = await fetch("/api/test-cursos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedContent),
      })

      const result = await saveResponse.json()
      if (result.success) {
        setIsEditing(false)
        alert("¡Contenido guardado exitosamente!")
      } else {
        alert("Error al guardar: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error saving content:", error)
      alert("Error al guardar el contenido")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = <K extends keyof CursoContent>(field: K, value: CursoContent[K]) => {
    if (!content) return
    setContent({
      ...content,
      [field]: value,
    })
  }

  const handleLearningItemChange = (index: number, value: string) => {
    if (!content) return
    const newItems = [...content.learningItems]
    newItems[index] = value
    setContent({
      ...content,
      learningItems: newItems,
    })
  }

  const addLearningItem = () => {
    if (!content) return
    setContent({
      ...content,
      learningItems: [...content.learningItems, "Nuevo elemento de aprendizaje"],
    })
  }

  const removeLearningItem = (index: number) => {
    if (!content) return
    setContent({
      ...content,
      learningItems: content.learningItems.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
          <p className="text-sm text-gray-400">ID: {proyectoId}</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Curso no encontrado</h1>
          <p className="text-gray-600 mb-4">No se pudo cargar el curso con ID: {proyectoId}</p>

          {/* Debug info */}
          <div className="bg-gray-100 p-4 rounded-lg mb-4 text-left text-sm">
            <p>
              <strong>ID buscado:</strong> {proyectoId}
            </p>
            <p>
              <strong>Tipo:</strong> {typeof proyectoId}
            </p>
            <p className="text-xs text-gray-500 mt-2">Revisa la consola del navegador para más detalles</p>
          </div>

          <div className="space-y-3">
            <Link
              href={`/proyectos/${proyectoId}`}
              className="block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver al proyecto
            </Link>
            <button
              onClick={loadCursoContent}
              className="block w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    )
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
                disabled={saving}
              >
                {isEditing ? "❌ Cancelar" : "✏️ Editar"}
              </button>
              {isEditing && (
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "💾 Guardando..." : "💾 Guardar"}
                </button>
              )}
            </div>
            <div className="text-xs text-center">Estado: {isEditing ? "🟢 Editando" : "🔴 Solo lectura"}</div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link
          href={`/proyectos/${proyectoId}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver al proyecto
        </Link>
      </div>

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
                  <p className="text-xs text-gray-500 text-center">Solo pega el ID de Vimeo</p>
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
                      <div className="flex-1 flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleLearningItemChange(index, e.target.value)}
                          className="text-gray-700 border rounded px-2 py-1 flex-1"
                        />
                        <button
                          onClick={() => removeLearningItem(index)}
                          className="text-red-500 hover:text-red-700 px-2"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-700">{item}</span>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <button
                    onClick={addLearningItem}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    + Agregar elemento
                  </button>
                )}
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
                      placeholder={`URL Icono ${i}`}
                    />
                  )}
                  <div className="w-20 h-20 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Image
                      src={
                        (content[`icon${i || "/placeholder.svg"}Image` as keyof CursoContent] as string) ||
                        "/placeholder.svg"
                      }
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
              {[
                { icon: <Calendar className="w-5 h-5" />, label: "Fecha", value: "courseDate" },
                { icon: <Clock className="w-5 h-5" />, label: "Hora", value: "courseTime" },
              ].map(({ icon, label, value }) => (
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
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
