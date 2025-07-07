"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import VimeoPlayer from "@/components/VimeoPlayer"
import { testimonialsData, type Testimonial } from "@/data/testimonials"
import Link from "next/link"
import { ChevronRight } from 'lucide-react';

export default function TestimoniosPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>(testimonialsData)
  const [playingVideos, setPlayingVideos] = useState<Set<string>>(new Set())

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    const savedTestimonials = localStorage.getItem("testimonialsData")
    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("testimonialsData", JSON.stringify(testimonials))
    setIsEditing(false)
    alert("Testimonios guardados exitosamente!")
  }

  const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string) => {
    setTestimonials((prev) =>
      prev.map((testimonial, i) => (i === index ? { ...testimonial, [field]: value } : testimonial)),
    )
  }

  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: "Nuevo Testimonio",
      description: "Descripción del testimonio",
      coverImage: "/placeholder.svg?height=300&width=400",
      videoUrl: "https://vimeo.com/1091240808",
      avatarImage: "/placeholder.svg?height=40&width=40",
      logoImage: "/placeholder.svg?height=30&width=30",
    }
    setTestimonials((prev) => [...prev, newTestimonial])
  }

  const removeTestimonial = (index: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este testimonio?")) {
      setTestimonials((prev) => prev.filter((_, i) => i !== index))
    }
  }

  const handlePlayVideo = (testimonialId: string) => {
    setPlayingVideos((prev) => new Set([...prev, testimonialId]))
  }

  const handleStopVideo = (testimonialId: string) => {
    setPlayingVideos((prev) => {
      const newSet = new Set(prev)
      newSet.delete(testimonialId)
      return newSet
    })
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
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                >
                  Guardar
                </button>
                <button
                  onClick={addTestimonial}
                  className="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600"
                >
                  + Agregar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-green-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">Testimonios</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Conoce las historias de éxito de nuestros estudiantes y familias
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="relative">
                {/* Admin Delete Button */}
                {isEditing && (
                  <button
                    onClick={() => removeTestimonial(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                  >
                    ×
                  </button>
                )}

                {/* Testimonial Card */}
                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  {/* Video/Image Section */}
                  <div className="relative bg-gray-100 w-full aspect-[9/14]">
                    {/* Logo in top-left corner */}
                    <div className="absolute top-4 left-4 z-10">
                      {isEditing ? (
                        <input
                          type="url"
                          value={testimonial.logoImage}
                          onChange={(e) => handleTestimonialChange(index, "logoImage", e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-32 bg-white/90"
                          placeholder="URL del logo"
                        />
                      ) : (
                        <Image
                          src={testimonial.logoImage || "/placeholder.svg"}
                          alt="Logo"
                          width={30}
                          height={30}
                          className="object-contain"
                        />
                      )}
                    </div>

                    {/* Cover Image or Video */}
                    {playingVideos.has(testimonial.id) ? (
                      <div className="relative w-full h-full">
                        <button
                          onClick={() => handleStopVideo(testimonial.id)}
                          className="absolute top-4 right-4 z-20 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          ✕
                        </button>
                        <VimeoPlayer videoUrl={testimonial.videoUrl}/>
                      </div>
                    ) : (
                      <>
                        {/* Cover Image */}
                        {isEditing && (
                          <div className="absolute top-4 right-4 z-10">
                            <input
                              type="url"
                              value={testimonial.coverImage}
                              onChange={(e) => handleTestimonialChange(index, "coverImage", e.target.value)}
                              className="border rounded px-2 py-1 text-xs w-32 bg-white/90"
                              placeholder="Imagen de portada"
                            />
                          </div>
                        )}

                        <Image
                          src={testimonial.coverImage || "/placeholder.svg"}
                          alt={`Testimonio de ${testimonial.name}`}
                          fill
                          className="object-cover"
                        />

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <button
                            onClick={() => handlePlayVideo(testimonial.id)}
                            className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                          >
                            <div className="w-0 h-0 border-l-[12px] border-l-gray-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                          </button>
                        </div>

                        {/* Video URL Input for Admin */}
                        {isEditing && (
                          <div className="absolute bottom-4 left-4 right-4">
                            <input
                              type="url"
                              value={testimonial.videoUrl}
                              onChange={(e) => handleTestimonialChange(index, "videoUrl", e.target.value)}
                              className="border rounded px-2 py-1 text-xs w-full bg-white/90"
                              placeholder="URL del video de Vimeo"
                            />
                          </div>
                        )}

                        {/* "Conoce su historia" text */}
                        <Link
                          href={`/testimonios/${testimonial.id}`}
                          className="absolute bottom-4 left-4 text-white hover:text-orange-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Conoce su historia</span>
                            <ChevronRight/>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {isEditing ? (
                          <div className="space-y-1">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                              <Image
                                src={testimonial.avatarImage || "/placeholder.svg"}
                                alt={testimonial.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            </div>
                            <input
                              type="url"
                              value={testimonial.avatarImage}
                              onChange={(e) => handleTestimonialChange(index, "avatarImage", e.target.value)}
                              className="border rounded px-1 py-1 text-xs w-20"
                              placeholder="Avatar URL"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={testimonial.avatarImage || "/placeholder.svg"}
                              alt={testimonial.name}
                              width={48}
                              height={48}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        )}
                      </div>

                      {/* Name and Description */}
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={testimonial.name}
                              onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
                              className="font-semibold text-gray-900 border rounded px-2 py-1 w-full"
                            />
                            <textarea
                              value={testimonial.description}
                              onChange={(e) => handleTestimonialChange(index, "description", e.target.value)}
                              className="text-sm text-gray-600 border rounded px-2 py-1 w-full h-16 resize-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{testimonial.name}</h3>
                            <p className="text-sm text-gray-600">{testimonial.description}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
