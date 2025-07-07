"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import VimeoPlayer from "@/components/VimeoPlayer"
import { testimonialDetailsData, type TestimonialDetail } from "@/data/testimonial-details"
import { useParams } from "next/navigation"
import Link from "next/link"

export default function TestimonialDetailPage() {
  const params = useParams()
  const testimonialId = params.id as string

  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [testimonialDetail, setTestimonialDetail] = useState<TestimonialDetail | null>(null)
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    // Load testimonial detail
    const savedDetails = localStorage.getItem("testimonialDetailsData")
    const details = savedDetails ? JSON.parse(savedDetails) : testimonialDetailsData

    const detail = details.find((d: TestimonialDetail) => d.id === testimonialId)
    if (detail) {
      setTestimonialDetail(detail)
    }
  }, [testimonialId])

  const handleSave = () => {
    if (!testimonialDetail) return

    const savedDetails = localStorage.getItem("testimonialDetailsData")
    const details = savedDetails ? JSON.parse(savedDetails) : testimonialDetailsData

    const updatedDetails = details.map((d: TestimonialDetail) => (d.id === testimonialId ? testimonialDetail : d))

    localStorage.setItem("testimonialDetailsData", JSON.stringify(updatedDetails))
    setIsEditing(false)
    alert("Testimonio guardado exitosamente!")
  }

  const handleInputChange = (field: keyof TestimonialDetail, value: string) => {
    if (!testimonialDetail) return
    setTestimonialDetail((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleElementChange = (index: number, field: "icon" | "text", value: string) => {
    if (!testimonialDetail) return
    setTestimonialDetail((prev) => {
      if (!prev) return null
      const newElements = [...prev.elementos]
      newElements[index] = { ...newElements[index], [field]: value }
      return { ...prev, elementos: newElements }
    })
  }

  const addElement = () => {
    if (!testimonialDetail) return
    setTestimonialDetail((prev) => {
      if (!prev) return null
      return {
        ...prev,
        elementos: [
          ...prev.elementos,
          {
            icon: "/placeholder.svg?height=32&width=32",
            text: "Nuevo elemento",
          },
        ],
      }
    })
  }

  const removeElement = (index: number) => {
    if (!testimonialDetail) return
    if (confirm("¿Estás seguro de que quieres eliminar este elemento?")) {
      setTestimonialDetail((prev) => {
        if (!prev) return null
        return {
          ...prev,
          elementos: prev.elementos.filter((_, i) => i !== index),
        }
      })
    }
  }

  const handleImageChange = (index: number, value: string) => {
    if (!testimonialDetail) return
    setTestimonialDetail((prev) => {
      if (!prev) return null
      const newImages = [...prev.additionalImages]
      newImages[index] = value
      return { ...prev, additionalImages: newImages }
    })
  }

  if (!testimonialDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Testimonio no encontrado</h1>
          <Link href="/testimonios" className="text-blue-500 hover:text-blue-600">
            Volver a testimonios
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border">
          <div className="flex gap-2 items-center">
            <div className="text-xs text-gray-500">
              {user?.name} ({user?.role?.toUpperCase()})
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
              >
                Guardar
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

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Right Column - Video (aparece primero en móvil) */}
          <div className="space-y-1 lg:order-2">
            {/* Main Image/Video */}
            <div className="relative aspect-[9/16] max-h-[600px] max-w-[350px] mx-auto rounded-2xl overflow-hidden bg-gray-100">
              {isEditing && (
                <div className="absolute top-4 left-4 right-4 z-10 space-y-2">
                  <input
                    type="url"
                    value={testimonialDetail.mainImage}
                    onChange={(e) => handleInputChange("mainImage", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm bg-white/90"
                    placeholder="URL de imagen principal"
                  />
                  <input
                    type="url"
                    value={testimonialDetail.videoUrl}
                    onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm bg-white/90"
                    placeholder="URL del video de Vimeo"
                  />
                </div>
              )}

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

                  {/* Play Button Overlay */}
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

          {/* Left Column - Contenido (aparece segundo en móvil, primero en desktop) */}
          <div className="space-y-8 lg:order-1">
            {/* Avatar and Info */}
            <div className="text-center">
              {isEditing && (
                <div className="mb-2">
                  <input
                    type="url"
                    value={testimonialDetail.avatarImage}
                    onChange={(e) => handleInputChange("avatarImage", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm mb-2"
                    placeholder="URL del avatar"
                  />
                </div>
              )}
              <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
                <Image
                  src={testimonialDetail.avatarImage || "/placeholder.svg"}
                  alt={testimonialDetail.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              </div>

              {isEditing ? (
                <input
                  type="text"
                  value={testimonialDetail.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="text-xl font-bold text-gray-900 mb-2 border rounded px-2 py-1 text-center w-full"
                />
              ) : (
                <h1 className="text-xl font-bold text-gray-900 mb-2">{testimonialDetail.name}</h1>
              )}

              {isEditing ? (
                <input
                  type="text"
                  value={testimonialDetail.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="text-gray-600 border rounded px-2 py-1 text-center w-full"
                />
              ) : (
                <p className="text-gray-600">{testimonialDetail.description}</p>
              )}
            </div>

            {/* Logo */}
            <div className="flex justify-center">
              {isEditing ? (
                <div className="text-center">
                  <input
                    type="url"
                    value={testimonialDetail.logoUrl}
                    onChange={(e) => handleInputChange("logoUrl", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-sm mb-2"
                    placeholder="URL del logo"
                  />
                  <Image
                    src={testimonialDetail.logoUrl || "/placeholder.svg"}
                    alt="Logo"
                    width={60}
                    height={60}
                    className="object-contain mx-auto"
                  />
                </div>
              ) : (
                <Image
                  src={testimonialDetail.logoUrl || "/placeholder.svg"}
                  alt="Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              )}
            </div>

            {/* Quote */}
            <div className="text-center">
              {isEditing ? (
                <textarea
                  value={testimonialDetail.quote}
                  onChange={(e) => handleInputChange("quote", e.target.value)}
                  className="text-2xl font-black text-gray-900 text-center border rounded px-4 py-2 w-full h-24 resize-none"
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
                  onChange={(e) => handleInputChange("historia", e.target.value)}
                  className="text-gray-600 leading-relaxed border rounded px-3 py-2 w-full h-32 resize-none"
                />
              ) : (
                <p className="text-gray-600 leading-relaxed">{testimonialDetail.historia}</p>
              )}
            </div>

            {/* Additional Images - New Layout */}
            <div className="grid grid-cols-2 gap-4 h-80">
              {/* Primera imagen - más grande, vertical */}
              <div className="relative">
                {isEditing && (
                  <input
                    type="url"
                    value={testimonialDetail.additionalImages[0]}
                    onChange={(e) => handleImageChange(0, e.target.value)}
                    className="absolute -top-8 left-0 right-0 border rounded px-1 py-1 text-xs bg-white z-10"
                    placeholder="Imagen principal"
                  />
                )}
                <div className="h-full rounded-lg overflow-hidden">
                  <Image
                    src={testimonialDetail.additionalImages[0] || "/placeholder.svg"}
                    alt="Imagen principal"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Dos imágenes más pequeñas a la derecha */}
              <div className="flex flex-col gap-4">
                <div className="relative flex-1">
                  {isEditing && (
                    <input
                      type="url"
                      value={testimonialDetail.additionalImages[1]}
                      onChange={(e) => handleImageChange(1, e.target.value)}
                      className="absolute -top-8 left-0 right-0 border rounded px-1 py-1 text-xs bg-white z-10"
                      placeholder="Imagen 2"
                    />
                  )}
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
                  {isEditing && (
                    <input
                      type="url"
                      value={testimonialDetail.additionalImages[2]}
                      onChange={(e) => handleImageChange(2, e.target.value)}
                      className="absolute -top-8 left-0 right-0 border rounded px-1 py-1 text-xs bg-white z-10"
                      placeholder="Imagen 3"
                    />
                  )}
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

            {/* Elementos - Completamente editables */}
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
                  <div key={index} className="relative flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                    {isEditing && (
                      <button
                        onClick={() => removeElement(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
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
                          className="border rounded px-2 py-1 w-full text-sm"
                          placeholder="URL del icono"
                        />
                        <input
                          type="text"
                          value={elemento.text}
                          onChange={(e) => handleElementChange(index, "text", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
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
