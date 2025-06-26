"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product, ToolkitSection } from "@/types/product"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, Save, ArrowLeft, Video, FileText, Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductFormProps {
  product?: Product
  isEditing?: boolean
}

const CATEGORIES = [
  { value: "libro", label: "Libro" },
  { value: "revista", label: "Revista" },
  { value: "toolkit", label: "Toolkit" },
] as const

const TOOLKIT_SUBCATEGORIES = [
  { value: "energia", label: "Energía" },
  { value: "alimentacion", label: "Alimentación" },
  { value: "meditacion", label: "Meditación" },
  { value: "negocio", label: "Negocio" },
] as const

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || "",
    author: product?.author || "",
    price: product?.price || 0,
    image: product?.image || "",
    stock: product?.stock || 0,
    category: product?.category || "libro",
    subCategory: product?.subCategory,
    description: product?.description || "",
    sections: product?.sections || [],
    trailerUrl: product?.trailerUrl || "",
    pdfUrl: product?.pdfUrl || "",
  })

  // Función para transformar URLs de Google Drive
  const transformDriveUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined
    
    // Si ya es un enlace de descarga directa, no hacer nada
    if (url.includes('uc?export=download')) return url
    
    // Extraer el ID del archivo de diferentes formatos de URL de Drive
    const patterns = [
      /drive\.google\.com\/file\/d\/([^\/]+)/,
      /drive\.google\.com\/open\?id=([^&]+)/,
      /drive\.google\.com\/uc\?id=([^&]+)/
    ]
    
    let fileId = null
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        fileId = match[1]
        break
      }
    }
    
    if (fileId) {
      return `https://drive.google.com/uc?export=download&id=${fileId}`
    }
    
    return url
  }

  const handleInputChange = <K extends keyof Product>(field: K, value: Product[K]) => {
    // Transformar automáticamente URLs de Drive para el campo pdfUrl
    if (field === 'pdfUrl' && typeof value === 'string') {
      value = transformDriveUrl(value) as Product[K]
    }
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCategoryChange = (category: Product["category"]) => {
    setFormData((prev) => ({
      ...prev,
      category,
      subCategory: undefined,
      sections: category === "toolkit" ? prev.sections : [],
    }))
  }

  const handleSectionChange = (index: number, field: keyof ToolkitSection, value: string) => {
    const newSections = [...(formData.sections || [])]
    newSections[index] = {
      ...newSections[index],
      [field]: field === 'fileUrl' ? transformDriveUrl(value) : value,
    }
    setFormData((prev) => ({
      ...prev,
      sections: newSections,
    }))
  }

  const addSection = () => {
    const newSection: ToolkitSection = {
      title: "",
      videoUrl: "",
      description: "",
      fileUrl: "",
    }
    setFormData((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }))
  }

  const removeSection = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const cleanUrl = (url: string | undefined): string | undefined => {
        if (!url || url.trim() === "") return undefined
        return url.trim()
      }

      const cleanedSections =
        formData.category === "toolkit" && formData.sections
          ? formData.sections.map((section) => ({
              ...section,
              videoUrl: cleanUrl(section.videoUrl),
              fileUrl: cleanUrl(transformDriveUrl(section.fileUrl)), // Asegurar transformación aquí también
              description: section.description?.trim() || undefined,
            }))
          : undefined

      const dataToSend = {
        name: formData.name?.trim(),
        author: formData.author?.trim(),
        price: formData.price,
        stock: formData.stock,
        image: formData.image?.trim(),
        category: formData.category,
        subCategory: formData.subCategory || undefined,
        description: formData.description?.trim(),
        trailerUrl: cleanUrl(formData.trailerUrl),
        pdfUrl: (formData.category === "libro" || formData.category === "revista") 
          ? cleanUrl(transformDriveUrl(formData.pdfUrl)) 
          : undefined,
        sections: cleanedSections,
      }

      if (isEditing && product?.id) {
        await api.patch(`/product/${product.id}`, dataToSend)
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente.",
        })
      } else {
        await api.post("/product", dataToSend)
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente.",
        })
      }
      router.push("/admin/products")
    } catch (error) {
      console.error("Error al guardar producto:", error)
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el producto.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const isToolkit = formData.category === "toolkit"
  const isBookOrMagazine = formData.category === "libro" || formData.category === "revista"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isEditing ? "Editar Producto" : "Crear Producto"}</h1>
            <p className="text-gray-600">
              {isEditing ? "Modifica los datos del producto" : "Completa la información del nuevo producto"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ingresa el nombre del producto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                  placeholder="Nombre del autor"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange("stock", Number.parseInt(e.target.value) || 0)}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isToolkit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subCategory">Subcategoría</Label>
                  <Select
                    value={formData.subCategory || ""}
                    onValueChange={(value) => handleInputChange("subCategory", value as Product["subCategory"])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOOLKIT_SUBCATEGORIES.map((subCategory) => (
                        <SelectItem key={subCategory.value} value={subCategory.value}>
                          {subCategory.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL de Imagen</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              </div>
            )}

            {!isToolkit && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="image">URL de Imagen</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                {isBookOrMagazine && (
                  <div className="space-y-2">
                    <Label htmlFor="pdfUrl">URL del PDF</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id="pdfUrl"
                        value={formData.pdfUrl || ""}
                        onChange={(e) => handleInputChange("pdfUrl", e.target.value)}
                        placeholder="https://drive.google.com/file/d/ID-DEL-ARCHIVO/view"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.pdfUrl && formData.pdfUrl.includes('drive.google.com') && 
                       !formData.pdfUrl.includes('uc?export=download') && (
                        <span>✔ El enlace de Drive será convertido automáticamente</span>
                      )}
                    </p>
                  </div>
                )}
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="trailerUrl">URL del Trailer</Label>
              <Input
                id="trailerUrl"
                value={formData.trailerUrl}
                onChange={(e) => handleInputChange("trailerUrl", e.target.value)}
                placeholder="https://example.com/trailer.mp4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe el producto en detalle..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        {isToolkit && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Contenido del Toolkit</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Agrega secciones con videos, archivos y descripciones para tu toolkit
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addSection}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sección
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.sections && formData.sections.length > 0 ? (
                <div className="space-y-6">
                  {formData.sections.map((section, index) => (
                    <div key={index} className="p-6 border rounded-lg space-y-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-medium text-gray-900 flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          Sección {index + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeSection(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <FileText className="h-4 w-4 mr-2" />
                            Título de la Sección
                          </Label>
                          <Input
                            value={section.title}
                            onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                            placeholder="Ej: Introducción al tema"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <Video className="h-4 w-4 mr-2" />
                            URL del Video (opcional)
                          </Label>
                          <Input
                            value={section.videoUrl || ""}
                            onChange={(e) => handleSectionChange(index, "videoUrl", e.target.value)}
                            placeholder="https://example.com/video.mp4"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="flex items-center">
                            <Link className="h-4 w-4 mr-2" />
                            URL del Archivo (opcional)
                          </Label>
                          <Input
                            value={section.fileUrl || ""}
                            onChange={(e) => handleSectionChange(index, "fileUrl", e.target.value)}
                            placeholder="https://drive.google.com/file/d/ID-DEL-ARCHIVO/view"
                          />
                          <p className="text-xs text-gray-500">
                            {section.fileUrl && section.fileUrl.includes('drive.google.com') && 
                             !section.fileUrl.includes('uc?export=download') && (
                              <span>✔ El enlace de Drive será convertido automáticamente</span>
                            )}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Descripción</Label>
                          <Textarea
                            value={section.description || ""}
                            onChange={(e) => handleSectionChange(index, "description", e.target.value)}
                            placeholder="Describe el contenido de esta sección..."
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium text-lg mb-2">No hay secciones agregadas</p>
                  <p className="text-sm mb-4">Los toolkits necesitan contenido organizado en secciones</p>
                  <Button type="button" variant="outline" onClick={addSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera Sección
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Guardando..." : isEditing ? "Actualizar Producto" : "Crear Producto"}
          </Button>
        </div>
      </form>
    </div>
  )
}