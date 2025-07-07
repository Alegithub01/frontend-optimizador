"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import { useParams } from "next/navigation"
import Link from "next/link"

interface BlogDetail {
  slug: string
  date: string
  author: string
  title: string
  heroImage: string
  subtitle: string
  mainContent: string
  secondaryContent: string
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState<BlogDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    loadBlogDetail()
  }, [slug])

  const loadBlogDetail = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/blog-details")
      if (response.ok) {
        const data = await response.json()
        const blogDetail = data.find((blog: BlogDetail) => blog.slug === slug)
        if (blogDetail) {
          setContent(blogDetail)
        } else {
          // Si no existe, crear uno nuevo
          const newBlogDetail: BlogDetail = {
            slug: slug,
            date: new Date().toLocaleDateString("es-ES"),
            author: "por Nuevo Autor",
            title: "Nuevo Blog Post",
            heroImage: "/placeholder.svg?height=400&width=800",
            subtitle: "Subtítulo del blog",
            mainContent: "Contenido principal del blog...",
            secondaryContent: "Contenido secundario del blog...",
          }
          setContent(newBlogDetail)
        }
      }
    } catch (error) {
      console.error("Error loading blog detail:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content) return

    setSaving(true)
    try {
      // Obtener todos los detalles actuales
      const response = await fetch("/api/blog-details")
      const allDetails = await response.json()

      // Actualizar o agregar el detalle específico
      const updatedDetails = allDetails.some((blog: BlogDetail) => blog.slug === content.slug)
        ? allDetails.map((blog: BlogDetail) => (blog.slug === content.slug ? content : blog))
        : [...allDetails, content]

      // Guardar los cambios
      const saveResponse = await fetch("/api/blog-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedDetails),
      })

      const result = await saveResponse.json()
      if (result.success) {
        setIsEditing(false)
        alert("¡Blog guardado exitosamente!")
      } else {
        alert("Error al guardar: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error saving blog:", error)
      alert("Error al guardar el blog")
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof BlogDetail, value: string) => {
    if (!content) return
    setContent({
      ...content,
      [field]: value,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog no encontrado</h1>
          <Link
            href="/blogs"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Volver a Blogs
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
                placeholder="URL de imagen principal"
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
          <Link
            href="/blogs"
            className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
          >
            ← Volver a Blogs
          </Link>
        </div>
      </article>
    </div>
  )
}
