"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import VimeoPlayer from "@/components/VimeoPlayer"
import { useParams } from "next/navigation"
import Link from "next/link"

interface TestimonialDetail {
  id: string
  name: string
  description: string
  avatarImage: string
  logoUrl: string
  quote: string
  historia: string
  mainImage: string
  videoUrl: string
  additionalImages: string[]
  elementos: {
    icon: string
    text: string
  }[]
}

export default function TestimonialDetailPage() {
  const params = useParams()
  const testimonialId = params.id as string
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [testimonialDetail, setTestimonialDetail] = useState<TestimonialDetail | null>(null)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    console.log("Loading testimonial detail for ID:", testimonialId)
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }
    loadTestimonialDetail()
  }, [testimonialId])

  const loadTestimonialDetail = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log("Fetching testimonial details...")
      const response = await fetch("/api/testimonial-details")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const details = await response.json()
      console.log("Received details:", details)
      console.log("Looking for ID:", testimonialId)
      const detail = details.find((d: TestimonialDetail) => d.id === testimonialId)
      console.log("Found detail:", detail)
      if (detail) {
        setTestimonialDetail(detail)
      } else {
        setError(`No se encontró el testimonio con ID: ${testimonialId}`)
      }
    } catch (error) {
      console.error("Error loading testimonial detail:", error)
      setError("Error al cargar el testimonio")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!testimonialDetail) return
    setSaving(true)
    try {
      // Obtener todos los detalles actuales
      const response = await fetch("/api/testimonial-details")
      const allDetails = await response.json()
      // Actualizar el detalle específico
      const updatedDetails = allDetails.map((detail: TestimonialDetail) =>
        detail.id === testimonialDetail.id ? testimonialDetail : detail,
      )
      // Guardar los cambios
      const saveResponse = await fetch("/api/testimonial-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDetails),
      })
      const result = await saveResponse.json()
      if (result.success) {
        setIsEditing(false)
        alert("¡Testimonio guardado exitosamente!")
      } else {
        alert("Error al guardar: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error saving testimonial:", error)
      alert("Error al guardar. Verifica tu conexión.")
    } finally {
      setSaving(false)
    }
  }

  const handleFieldChange = (field: keyof TestimonialDetail, value: string) => {
    if (!testimonialDetail) return
    setTestimonialDetail({
      ...testimonialDetail,
      [field]: value,
    })
  }

  const handleAdditionalImageChange = (index: number, value: string) => {
    if (!testimonialDetail) return
    const updatedImages = [...testimonialDetail.additionalImages]
    updatedImages[index] = value
    setTestimonialDetail({
      ...testimonialDetail,
      additionalImages: updatedImages,
    })
  }

  const handleElementChange = (index: number, field: "icon" | "text", value: string) => {
    if (!testimonialDetail) return
    const updatedElementos = testimonialDetail.elementos.map((elemento, i) =>
      i === index ? { ...elemento, [field]: value } : elemento,
    )
    setTestimonialDetail({
      ...testimonialDetail,
      elementos: updatedElementos,
    })
  }

  const addElement = () => {
    if (!testimonialDetail) return
    setTestimonialDetail({
      ...testimonialDetail,
      elementos: [
        ...testimonialDetail.elementos,
        { icon: "/placeholder.svg?height=32&width=32", text: "Nuevo elemento" },
      ],
    })
  }

  const removeElement = (index: number) => {
    if (!testimonialDetail) return
    setTestimonialDetail({
      ...testimonialDetail,
      elementos: testimonialDetail.elementos.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando testimonio...</p>
          <p className="text-sm text-gray-400 mt-2">ID: {testimonialId}</p>
        </div>
      </div>
    )
  }

  if (error || !testimonialDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Testimonio no encontrado</h1>
          <p className="text-gray-600 mb-4">{error || "El testimonio que buscas no existe."}</p>
          <p className="text-sm text-gray-400 mb-6">ID buscado: {testimonialId}</p>
          <div className="space-y-3">
            <Link
              href="/testimonios"
              className="block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Volver a testimonios
            </Link>
            <button
              onClick={loadTestimonialDetail}
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
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="text-xs text-gray-500">
              {user?.name} ({user?.role?.toUpperCase()})
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
              disabled={saving}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <Link href="/testimonios" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 12H5M12 19L5 12L12 5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Volver a testimonios
        </Link>
      </div>

      {/* Debug Info (solo para admin) */}
      {isAdmin && (
        <div className="container mx-auto px-4 mb-4">
          <div className="bg-gray-100 p-4 rounded-lg text-sm">
            <p>
              <strong>Debug Info:</strong>
            </p>
            <p>ID: {testimonialId}</p>
            <p>Testimonio encontrado: {testimonialDetail ? "Sí" : "No"}</p>
            <p>Nombre: {testimonialDetail?.name}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Right Column - Video */}
          <div className="space-y-1 lg:order-2">
            {/* Video URL Editor */}
            {isEditing && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">URL del Video:</label>
                <input
                  type="url"
                  value={testimonialDetail.videoUrl}
                  onChange={(e) => handleFieldChange("videoUrl", e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full"
                  placeholder="URL del video de Vimeo"
                />
              </div>
            )}

            {/* Main Image Editor */}
            {isEditing && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Imagen Principal:</label>
                <input
                  type="url"
                  value={testimonialDetail.mainImage}
                  onChange={(e) => handleFieldChange("mainImage", e.target.value)}
                  className="border rounded px-3 py-2 text-sm w-full"
                  placeholder="URL de la imagen principal"
                />
              </div>
            )}

            <div className="relative aspect-[9/16] max-h-[600px] max-w-[350px] mx-auto rounded-2xl overflow-hidden bg-gray-100">
              {isPlayingVideo ? (
                <div className="relative w-full h-full">
                  <button
                    onClick={() => setIsPlayingVideo(false)}
                    className="absolute top-4 right-4 z-20 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    ✕
                  </button>
                  <VimeoPlayer videoUrl={testimonialDetail.videoUrl} />
                </div>
              ) : (
                <>
                  <Image
                    src={testimonialDetail.mainImage || "/placeholder.svg"}
                    alt={testimonialDetail.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <button
                      onClick={() => setIsPlayingVideo(true)}
                      className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <div className="w-0 h-0 border-l-[16px] border-l-gray-800 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Left Column - Content */}
          <div className="space-y-8 lg:order-1">
            {/* Avatar and Info */}
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={testimonialDetail.avatarImage || "/placeholder.svg"}
                  alt={testimonialDetail.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>
              {isEditing && (
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Avatar:</label>
                  <input
                    type="url"
                    value={testimonialDetail.avatarImage}
                    onChange={(e) => handleFieldChange("avatarImage", e.target.value)}
                    className="border rounded px-2 py-1 text-xs w-full"
                    placeholder="URL del avatar"
                  />
                </div>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={testimonialDetail.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  className="text-xl font-bold text-gray-900 mb-2 border rounded px-2 py-1 w-full"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900 mb-2">{testimonialDetail.name}</h1>
              )}
              {isEditing ? (
                <input
                  type="text"
                  value={testimonialDetail.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  className="text-gray-600 border rounded px-2 py-1 w-full"
                />
              ) : (
                <p className="text-gray-600">{testimonialDetail.description}</p>
              )}
            </div>

            {/* Logo */}
            <div className="flex justify-center">
              {isEditing && (
                <div className="w-full max-w-xs mb-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-center">Logo:</label>
                  <input
                    type="url"
                    value={testimonialDetail.logoUrl}
                    onChange={(e) => handleFieldChange("logoUrl", e.target.value)}
                    className="border rounded px-2 py-1 text-xs w-full"
                    placeholder="URL del logo"
                  />
                </div>
              )}
              <Image
                src={testimonialDetail.logoUrl || "/placeholder.svg"}
                alt="Logo"
                width={60}
                height={60}
                className="object-contain"
              />
            </div>

            {/* Quote */}
            <div className="text-center">
              {isEditing ? (
                <textarea
                  value={testimonialDetail.quote}
                  onChange={(e) => handleFieldChange("quote", e.target.value)}
                  className="text-2xl font-black text-gray-900 border rounded px-4 py-2 w-full h-20 resize-none text-center"
                />
              ) : (
                <h2 className="text-2xl font-black text-gray-900">"{testimonialDetail.quote}"</h2>
              )}
            </div>

            {/* Historia */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Historia</h3>
              {isEditing ? (
                <textarea
                  value={testimonialDetail.historia}
                  onChange={(e) => handleFieldChange("historia", e.target.value)}
                  className="text-gray-600 leading-relaxed border rounded px-4 py-2 w-full h-32 resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">{testimonialDetail.historia}</p>
              )}
            </div>

            {/* Additional Images */}
            <div>
              {isEditing && (
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Imágenes Adicionales:</h4>
                  <div className="space-y-2">
                    <input
                      type="url"
                      value={testimonialDetail.additionalImages[0] || ""}
                      onChange={(e) => handleAdditionalImageChange(0, e.target.value)}
                      className="border rounded px-2 py-1 text-xs w-full"
                      placeholder="URL de la imagen 1 (principal)"
                    />
                    <input
                      type="url"
                      value={testimonialDetail.additionalImages[1] || ""}
                      onChange={(e) => handleAdditionalImageChange(1, e.target.value)}
                      className="border rounded px-2 py-1 text-xs w-full"
                      placeholder="URL de la imagen 2 (superior derecha)"
                    />
                    <input
                      type="url"
                      value={testimonialDetail.additionalImages[2] || ""}
                      onChange={(e) => handleAdditionalImageChange(2, e.target.value)}
                      className="border rounded px-2 py-1 text-xs w-full"
                      placeholder="URL de la imagen 3 (inferior derecha)"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 h-80">
                <div className="relative">
                  <div className="h-full rounded-lg overflow-hidden">
                    <Image
                      src={testimonialDetail.additionalImages[0] || "/placeholder.svg"}
                      alt="Imagen principal"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="relative flex-1">
                    <div className="h-full rounded-lg overflow-hidden">
                      <Image
                        src={testimonialDetail.additionalImages[1] || "/placeholder.svg"}
                        alt="Imagen 2"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="relative flex-1">
                    <div className="h-full rounded-lg overflow-hidden">
                      <Image
                        src={testimonialDetail.additionalImages[2] || "/placeholder.svg"}
                        alt="Imagen 3"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Elementos */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 text-center flex-1">
                  {testimonialDetail.elementos.length} ELEMENTOS
                </h3>
                {isEditing && (
                  <button
                    onClick={addElement}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                  >
                    + Agregar
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {testimonialDetail.elementos.map((elemento, index) => (
                  <div key={index} className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                    {isEditing && (
                      <button
                        onClick={() => removeElement(index)}
                        className="text-red-500 hover:text-red-700 font-bold"
                      >
                        ×
                      </button>
                    )}
                    <div className="w-8 h-8 flex-shrink-0">
                      <Image
                        src={elemento.icon || "/placeholder.svg"}
                        alt={elemento.text}
                        width={32}
                        height={32}
                        className="object-contain"
                      />
                    </div>
                    {isEditing ? (
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={elemento.icon}
                          onChange={(e) => handleElementChange(index, "icon", e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-full"
                          placeholder="URL del icono"
                        />
                        <input
                          type="text"
                          value={elemento.text}
                          onChange={(e) => handleElementChange(index, "text", e.target.value)}
                          className="text-gray-700 font-medium border rounded px-2 py-1 w-full"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-700 font-medium">{elemento.text}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
