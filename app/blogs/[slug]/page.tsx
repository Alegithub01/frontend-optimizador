"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import { useParams } from "next/navigation"

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState({
    date: "01-04-2024",
    author: "por Nochur Crosby",
    title: "¿Que es marketing en negocios?",
    heroImage: "/placeholder.svg?height=400&width=800",
    subtitle: "Subtítulo o subtema",
    mainContent: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
    contentImage: "/placeholder.svg?height=300&width=600", // ya no se usa pero lo dejo por si acaso lo necesitás después
    secondaryContent: `Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestae consequatur.`,
  })

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    // Load content specific to this blog post
    const savedContent = localStorage.getItem(`blogPost_${slug}`)
    if (savedContent) {
      setContent(JSON.parse(savedContent))
    }
  }, [slug])

  const handleSave = () => {
    localStorage.setItem(`blogPost_${slug}`, JSON.stringify(content))
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

      {/* Blog Post Content */}
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-orange-500 mb-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={content.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
                <input
                  type="text"
                  value={content.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  className="border rounded px-2 py-1 text-xs"
                />
              </>
            ) : (
              <>
                <span>{content.date}</span>
                <span>{content.author}</span>
              </>
            )}
          </div>

          {isEditing ? (
            <input
              type="text"
              value={content.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="text-3xl md:text-4xl font-black text-gray-900 mb-6 border rounded px-2 py-1 w-full"
            />
          ) : (
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">{content.title}</h1>
          )}
        </header>

        {/* Hero Image */}
        <div className="relative mb-8">
          {isEditing && (
            <div className="mb-4">
              <input
                type="url"
                value={content.heroImage}
                onChange={(e) => handleInputChange("heroImage", e.target.value)}
                className="border rounded px-2 py-1 w-full text-sm"
                placeholder="URL de Cloudinary para imagen principal"
              />
            </div>
          )}
          <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
            <Image src={content.heroImage || "/placeholder.svg"} alt={content.title} fill className="object-cover" />
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Subtitle */}
          {isEditing ? (
            <input
              type="text"
              value={content.subtitle}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              className="text-xl font-bold text-gray-900 mb-6 border rounded px-2 py-1 w-full"
            />
          ) : (
            <h2 className="text-xl font-bold text-gray-900 mb-6">{content.subtitle}</h2>
          )}

          {/* Main Content */}
          {isEditing ? (
            <textarea
              value={content.mainContent}
              onChange={(e) => handleInputChange("mainContent", e.target.value)}
              className="text-gray-700 leading-relaxed mb-8 border rounded px-2 py-1 w-full h-40 resize-none"
            />
          ) : (
            <div className="text-gray-700 leading-relaxed mb-8">
              {content.mainContent.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}

          {/* Secondary Content */}
          {isEditing ? (
            <textarea
              value={content.secondaryContent}
              onChange={(e) => handleInputChange("secondaryContent", e.target.value)}
              className="text-gray-700 leading-relaxed border rounded px-2 py-1 w-full h-40 resize-none"
            />
          ) : (
            <div className="text-gray-700 leading-relaxed">
              <br />
              <br />
              <br />
              {content.secondaryContent.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12 pt-8 border-t">
          <a
            href="/blogs"
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
          >
            ← Volver a Blogs
          </a>
        </div>
      </article>
    </div>
  )
}
