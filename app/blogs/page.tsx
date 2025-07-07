"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"

interface Blog {
  id: string
  date: string
  author: string
  title: string
  description: string
  image: string
  slug: string
}

export default function BlogsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pageContent, setPageContent] = useState({
    pageTitle: "Todos nuestros",
    pageSubtitle: "BLOGS",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    loadBlogs()
  }, [])

  const loadBlogs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/blogs")
      if (response.ok) {
        const data = await response.json()
        setBlogs(data)
      }
    } catch (error) {
      console.error("Error loading blogs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(blogs),
      })

      const result = await response.json()
      if (result.success) {
        setIsEditing(false)
        alert("¡Blogs guardados exitosamente!")
      } else {
        alert("Error al guardar blogs: " + (result.error || "Error desconocido"))
      }
    } catch (error) {
      console.error("Error saving blogs:", error)
      alert("Error al guardar blogs. Verifica tu conexión.")
    } finally {
      setSaving(false)
    }
  }

  const handleBlogChange = (index: number, field: keyof Blog, value: string) => {
    setBlogs((prev) => prev.map((blog, i) => (i === index ? { ...blog, [field]: value } : blog)))
  }

  const addBlog = () => {
    const newBlog: Blog = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("es-ES"),
      author: "por Nuevo Autor",
      title: "Nuevo Blog",
      description: "Descripción del nuevo blog...",
      image: "/placeholder.svg?height=200&width=300",
      slug: "nuevo-blog-" + Date.now(),
    }
    setBlogs((prev) => [...prev, newBlog])
  }

  const removeBlog = (index: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este blog?")) {
      setBlogs((prev) => prev.filter((_, i) => i !== index))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
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
              <>
                <button
                  onClick={handleSave}
                  className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600 disabled:opacity-50"
                  disabled={saving}
                >
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={addBlog}
                  className="bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600"
                  disabled={saving}
                >
                  + Agregar Blog
                </button>
              </>
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
                  value={pageContent.pageTitle}
                  onChange={(e) => setPageContent((prev) => ({ ...prev, pageTitle: e.target.value }))}
                  className="text-orange-500 text-lg font-medium border rounded px-2 py-1 text-center"
                />
                <input
                  type="text"
                  value={pageContent.pageSubtitle}
                  onChange={(e) => setPageContent((prev) => ({ ...prev, pageSubtitle: e.target.value }))}
                  className="text-4xl md:text-5xl font-black text-gray-900 border rounded px-2 py-1 text-center w-full"
                />
              </div>
            ) : (
              <>
                <p className="text-orange-500 text-lg font-medium mb-2">{pageContent.pageTitle}</p>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900">{pageContent.pageSubtitle}</h1>
              </>
            )}
          </div>

          {/* Blogs Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {blogs.map((blog, index) => (
              <div key={blog.id} className="relative">
                {/* Admin Delete Button */}
                {isEditing && (
                  <button
                    onClick={() => removeBlog(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 z-10"
                  >
                    ×
                  </button>
                )}

                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                  <div className="relative h-48">
                    {isEditing && (
                      <div className="absolute top-2 left-2 right-2 z-10">
                        <input
                          type="url"
                          value={blog.image}
                          onChange={(e) => handleBlogChange(index, "image", e.target.value)}
                          className="border rounded px-2 py-1 w-full text-xs bg-white/90"
                          placeholder="URL de imagen"
                        />
                      </div>
                    )}
                    <Image src={blog.image || "/placeholder.svg"} alt={blog.title} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-orange-500 mb-3">
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            value={blog.date}
                            onChange={(e) => handleBlogChange(index, "date", e.target.value)}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                          <input
                            type="text"
                            value={blog.author}
                            onChange={(e) => handleBlogChange(index, "author", e.target.value)}
                            className="border rounded px-1 py-0.5 text-xs"
                          />
                        </>
                      ) : (
                        <>
                          <span>{blog.date}</span>
                          <span>{blog.author}</span>
                        </>
                      )}
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={blog.title}
                        onChange={(e) => handleBlogChange(index, "title", e.target.value)}
                        className="text-xl font-bold text-gray-900 mb-3 border rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{blog.title}</h3>
                    )}
                    {isEditing ? (
                      <textarea
                        value={blog.description}
                        onChange={(e) => handleBlogChange(index, "description", e.target.value)}
                        className="text-gray-600 text-sm leading-relaxed mb-4 border rounded px-2 py-1 w-full h-20 resize-none"
                      />
                    ) : (
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">{blog.description}</p>
                    )}
                    {isEditing && (
                      <input
                        type="text"
                        value={blog.slug}
                        onChange={(e) => handleBlogChange(index, "slug", e.target.value)}
                        className="border rounded px-2 py-1 w-full text-xs mb-2"
                        placeholder="URL del blog (ej: titulo-principal-h1)"
                      />
                    )}
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors inline-block"
                    >
                      Ver más
                    </Link>
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
