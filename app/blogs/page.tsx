"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"

export default function BlogsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState({
    pageTitle: "Todos nuestros",
    pageSubtitle: "BLOGS",
    blog1Date: "01-04-2024",
    blog1Author: "por Nochur Crosby",
    blog1Title: "Título principal H1",
    blog1Description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    blog1Image: "/placeholder.svg?height=200&width=300",
    blog1Slug: "titulo-principal-h1",
    blog2Date: "01-04-2024",
    blog2Author: "por Nochur Crosby",
    blog2Title: "Título principal H1",
    blog2Description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    blog2Image: "/placeholder.svg?height=200&width=300",
    blog2Slug: "titulo-principal-h1-2",
    blog3Date: "01-04-2024",
    blog3Author: "por Nochur Crosby",
    blog3Title: "Título principal H1",
    blog3Description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    blog3Image: "/placeholder.svg?height=200&width=300",
    blog3Slug: "titulo-principal-h1-3",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    const savedContent = localStorage.getItem("blogsContent")
    if (savedContent) {
      setContent(JSON.parse(savedContent))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("blogsContent", JSON.stringify(content))
    setIsEditing(false)
    alert("Contenido guardado exitosamente!")
  }

  const handleInputChange = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }))
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

      {/* Header Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            {isEditing ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={content.pageTitle}
                  onChange={(e) => handleInputChange("pageTitle", e.target.value)}
                  className="text-orange-500 text-lg font-medium border rounded px-2 py-1 text-center"
                />
                <input
                  type="text"
                  value={content.pageSubtitle}
                  onChange={(e) => handleInputChange("pageSubtitle", e.target.value)}
                  className="text-4xl md:text-5xl font-black text-gray-900 border rounded px-2 py-1 text-center w-full"
                />
              </div>
            ) : (
              <>
                <p className="text-orange-500 text-lg font-medium mb-2">{content.pageTitle}</p>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900">{content.pageSubtitle}</h1>
              </>
            )}
          </div>

          {/* Blogs Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Blog 1 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                {isEditing && (
                  <div className="absolute top-2 left-2 right-2 z-10">
                    <input
                      type="url"
                      value={content.blog1Image}
                      onChange={(e) => handleInputChange("blog1Image", e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs bg-white/90"
                      placeholder="URL Cloudinary Blog 1"
                    />
                  </div>
                )}
                <Image src={content.blog1Image || "/placeholder.svg"} alt="Blog 1" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-orange-500 mb-3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={content.blog1Date}
                        onChange={(e) => handleInputChange("blog1Date", e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                      <input
                        type="text"
                        value={content.blog1Author}
                        onChange={(e) => handleInputChange("blog1Author", e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                    </>
                  ) : (
                    <>
                      <span>{content.blog1Date}</span>
                      <span>{content.blog1Author}</span>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={content.blog1Title}
                    onChange={(e) => handleInputChange("blog1Title", e.target.value)}
                    className="text-xl font-bold text-gray-900 mb-3 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{content.blog1Title}</h3>
                )}

                {isEditing ? (
                  <textarea
                    value={content.blog1Description}
                    onChange={(e) => handleInputChange("blog1Description", e.target.value)}
                    className="text-gray-600 text-sm leading-relaxed mb-4 border rounded px-2 py-1 w-full h-20 resize-none"
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{content.blog1Description}</p>
                )}

                {isEditing && (
                  <input
                    type="text"
                    value={content.blog1Slug}
                    onChange={(e) => handleInputChange("blog1Slug", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-xs mb-2"
                    placeholder="URL del blog (ej: titulo-principal-h1)"
                  />
                )}

                <Link
                  href={`/blogs/${content.blog1Slug}`}
                  className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors inline-block"
                >
                  Ver más
                </Link>
              </div>
            </div>

            {/* Blog 2 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                {isEditing && (
                  <div className="absolute top-2 left-2 right-2 z-10">
                    <input
                      type="url"
                      value={content.blog2Image}
                      onChange={(e) => handleInputChange("blog2Image", e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs bg-white/90"
                      placeholder="URL Cloudinary Blog 2"
                    />
                  </div>
                )}
                <Image src={content.blog2Image || "/placeholder.svg"} alt="Blog 2" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-orange-500 mb-3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={content.blog2Date}
                        onChange={(e) => handleInputChange("blog2Date", e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                      <input
                        type="text"
                        value={content.blog2Author}
                        onChange={(e) => handleInputChange("blog2Author", e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                    </>
                  ) : (
                    <>
                      <span>{content.blog2Date}</span>
                      <span>{content.blog2Author}</span>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={content.blog2Title}
                    onChange={(e) => handleInputChange("blog2Title", e.target.value)}
                    className="text-xl font-bold text-gray-900 mb-3 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{content.blog2Title}</h3>
                )}

                {isEditing ? (
                  <textarea
                    value={content.blog2Description}
                    onChange={(e) => handleInputChange("blog2Description", e.target.value)}
                    className="text-gray-600 text-sm leading-relaxed mb-4 border rounded px-2 py-1 w-full h-20 resize-none"
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{content.blog2Description}</p>
                )}

                {isEditing && (
                  <input
                    type="text"
                    value={content.blog2Slug}
                    onChange={(e) => handleInputChange("blog2Slug", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-xs mb-2"
                    placeholder="URL del blog (ej: titulo-principal-h1-2)"
                  />
                )}

                <Link
                  href={`/blogs/${content.blog2Slug}`}
                  className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors inline-block"
                >
                  Ver más
                </Link>
              </div>
            </div>

            {/* Blog 3 */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                {isEditing && (
                  <div className="absolute top-2 left-2 right-2 z-10">
                    <input
                      type="url"
                      value={content.blog3Image}
                      onChange={(e) => handleInputChange("blog3Image", e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs bg-white/90"
                      placeholder="URL Cloudinary Blog 3"
                    />
                  </div>
                )}
                <Image src={content.blog3Image || "/placeholder.svg"} alt="Blog 3" fill className="object-cover" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-orange-500 mb-3">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={content.blog3Date}
                        onChange={(e) => handleInputChange("blog3Date", e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                      <input
                        type="text"
                        value={content.blog3Author}
                        onChange={(e) => handleInputChange("blog3Author", e.target.value)}
                        className="border rounded px-1 py-0.5 text-xs"
                      />
                    </>
                  ) : (
                    <>
                      <span>{content.blog3Date}</span>
                      <span>{content.blog3Author}</span>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={content.blog3Title}
                    onChange={(e) => handleInputChange("blog3Title", e.target.value)}
                    className="text-xl font-bold text-gray-900 mb-3 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{content.blog3Title}</h3>
                )}

                {isEditing ? (
                  <textarea
                    value={content.blog3Description}
                    onChange={(e) => handleInputChange("blog3Description", e.target.value)}
                    className="text-gray-600 text-sm leading-relaxed mb-4 border rounded px-2 py-1 w-full h-20 resize-none"
                  />
                ) : (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{content.blog3Description}</p>
                )}

                {isEditing && (
                  <input
                    type="text"
                    value={content.blog3Slug}
                    onChange={(e) => handleInputChange("blog3Slug", e.target.value)}
                    className="border rounded px-2 py-1 w-full text-xs mb-2"
                    placeholder="URL del blog (ej: titulo-principal-h1-3)"
                  />
                )}

                <Link
                  href={`/blogs/${content.blog3Slug}`}
                  className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors inline-block"
                >
                  Ver más
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
