"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Product, ToolkitSection } from "@/types/product" // Assuming types/product.ts exists and defines Product and ToolkitSection
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, Save, ArrowLeft, Video, FileText, Link, ImageIcon, Film, Baby, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ProductFormProps {
  product?: Product
  isEditing?: boolean
}

const CATEGORIES = [
  { value: "libro", label: "Libro" },
  { value: "revista", label: "Revista" },
  { value: "toolkit", label: "Toolkit" },
  { value: "e-kit", label: "E-Kit" },
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
    physicalPrice: product?.physicalPrice || 0, // <--- AÑADIDO: Inicializar physicalPrice
    image: product?.image || "",
    extraImageUrl: product?.extraImageUrl || "",
    extraImageUrlDos: product?.extraImageUrlDos || "",
    gifUrl: product?.gifUrl || "",
    stock: product?.stock || 0,
    category: product?.category || "libro",
    subCategory: product?.subCategory,
    description: product?.description || "",
    sections: product?.sections || [],
    trailerUrl: product?.trailerUrl || "",
    pdfUrl: product?.pdfUrl || "",
    isFree: product?.isFree || false, // Added isFree field initialization
  })

  // Función para transformar URLs de Google Drive
  const transformDriveUrl = (url: string | undefined): string | undefined => {
    if (!url) return undefined
    // Ya es un enlace de descarga directa
    if (url.includes("uc?export=download")) return url
    // Google Sheets → .xlsx
    if (url.includes("docs.google.com/spreadsheets")) {
      const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
      if (match?.[1]) {
        return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=xlsx`
      }
    }
    // Google Docs → .docx
    if (url.includes("docs.google.com/document")) {
      const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)
      if (match?.[1]) {
        return `https://docs.google.com/document/d/${match[1]}/export?format=docx`
      }
    }
    // Google Slides → .pptx
    if (url.includes("docs.google.com/presentation")) {
      const match = url.match(/\/presentation\/d\/([a-zA-Z0-9-_]+)/)
      if (match?.[1]) {
        return `https://docs.google.com/presentation/d/${match[1]}/export/pptx`
      }
    }
    // Archivos públicos de Drive (PDF, Word, etc.)
    const patterns = [
      /drive\.google\.com\/file\/d\/([^/]+)/,
      /drive\.google\.com\/open\?id=([^&]+)/,
      /drive\.google\.com\/uc\?id=([^&]+)/,
    ]
    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match?.[1]) {
        return `https://drive.google.com/uc?export=download&id=${match[1]}`
      }
    }
    // Si no se reconoce, devolver la URL tal cual
    return url
  }

  const handleInputChange = (field: keyof Product, value: any) => {
    // Transformar automáticamente URLs de Drive para el campo pdfUrl
    if (field === "pdfUrl" && typeof value === "string") {
      value = transformDriveUrl(value)
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
      subCategory: undefined, // Reset subCategory when category changes
      sections: category === "toolkit" || category === "e-kit" ? prev.sections : [], // Clear sections if not toolkit/e-kit
      // Clear physicalPrice if not libro/revista
      physicalPrice: category === "libro" || category === "revista" ? prev.physicalPrice : undefined,
    }))
  }

  const handleSectionChange = (index: number, field: keyof ToolkitSection, value: string) => {
    const newSections = [...(formData.sections || [])]
    newSections[index] = {
      ...newSections[index],
      [field]: field === "fileUrl" || field === "downloadUrl" ? transformDriveUrl(value) : value,
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
      downloadUrl: "",
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

      // Limpiar y preparar las secciones
      const cleanedSections =
        (formData.category === "toolkit" || formData.category === "e-kit") && formData.sections
          ? formData.sections
              .filter((section) => section.title.trim() !== "") // Solo incluir secciones con título
              .map((section) => ({
                title: section.title.trim(),
                videoUrl: cleanUrl(section.videoUrl),
                fileUrl: cleanUrl(transformDriveUrl(section.fileUrl)),
                downloadUrl: cleanUrl(transformDriveUrl(section.downloadUrl)),
                description: section.description?.trim() || undefined,
              }))
          : undefined

      const dataToSend: Partial<Product> = {
        name: formData.name?.trim(),
        author: formData.author?.trim(),
        price: Number(formData.price),
        stock: Number(formData.stock),
        image: formData.image?.trim(),
        extraImageUrl: cleanUrl(formData.extraImageUrl),
        extraImageUrlDos: cleanUrl(formData.extraImageUrlDos),
        gifUrl: cleanUrl(formData.gifUrl),
        category: formData.category,
        subCategory: formData.subCategory || undefined,
        description: formData.description?.trim(),
        trailerUrl: cleanUrl(formData.trailerUrl),
        pdfUrl:
          formData.category === "libro" || formData.category === "revista"
            ? cleanUrl(transformDriveUrl(formData.pdfUrl))
            : undefined,
        sections: cleanedSections,
        isFree: formData.isFree, // Added isFree to data being sent
      }

      // <--- AÑADIDO: Incluir physicalPrice solo para categorías específicas
      if (formData.category === "libro" || formData.category === "revista") {
        dataToSend.physicalPrice = Number(formData.physicalPrice)
      } else {
        dataToSend.physicalPrice = undefined // Ensure it's not sent for other categories
      }

      // Log para debugging
      console.log("Datos a enviar:", JSON.stringify(dataToSend, null, 2))

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

  const isToolkitOrEkids = formData.category === "toolkit" || formData.category === "e-kit"
  const isBookOrMagazine = formData.category === "libro" || formData.category === "revista"

  const getCategoryIcon = () => {
    switch (formData.category) {
      case "e-kit":
        return <Baby className="h-5 w-5 mr-2" />
      case "toolkit":
        return <Package className="h-5 w-5 mr-2" />
      default:
        return <FileText className="h-5 w-5 mr-2" />
    }
  }

  const getSectionTitle = () => {
    return formData.category === "e-kit" ? "Contenido de E-Kit" : "Contenido del Toolkit"
  }

  const getSectionDescription = () => {
    return formData.category === "e-kit"
      ? "Agrega secciones con videos, archivos y descripciones para tu contenido e-kit"
      : "Agrega secciones con videos, archivos y descripciones para tu toolkit"
  }

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
                <Label htmlFor="price">Precio (Digital)</Label> {/* Updated label */}
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
              {isBookOrMagazine && ( // <--- AÑADIDO: Campo de precio físico condicional
                <div className="space-y-2">
                  <Label htmlFor="physicalPrice">Precio (Físico)</Label>
                  <Input
                    id="physicalPrice"
                    type="number"
                    step="0.01"
                    value={formData.physicalPrice}
                    onChange={(e) => handleInputChange("physicalPrice", Number.parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                  />
                </div>
              )}
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) => handleInputChange("isFree", checked)}
              />
              <Label
                htmlFor="isFree"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Producto gratuito
              </Label>
            </div>
            {isToolkitOrEkids && (
              <div className="space-y-2">
                <Label htmlFor="subCategory">Subcategoría *</Label>
                <Select
                  value={formData.subCategory || ""}
                  onValueChange={(value) => handleInputChange("subCategory", value as Product["subCategory"])}
                  required
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
            )}
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
        {/* Card de Multimedia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ImageIcon className="h-5 w-5 mr-2" />
              Contenido Multimedia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="image" className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  URL de Imagen Principal
                </Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extraImageUrl" className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  URL de Imagen Extra
                </Label>
                <Input
                  id="extraImageUrl"
                  value={formData.extraImageUrl}
                  onChange={(e) => handleInputChange("extraImageUrl", e.target.value)}
                  placeholder="https://example.com/extra-image.jpg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="extraImageUrlDos" className="flex items-center">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  URL de Imagen Extra 2
                </Label>
                <Input
                  id="extraImageUrlDos"
                  value={formData.extraImageUrlDos}
                  onChange={(e) => handleInputChange("extraImageUrlDos", e.target.value)}
                  placeholder="https://example.com/extra-image-2.jpg"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gifUrl" className="flex items-center">
                  <Film className="h-4 w-4 mr-2" />
                  URL del GIF
                </Label>
                <Input
                  id="gifUrl"
                  value={formData.gifUrl}
                  onChange={(e) => handleInputChange("gifUrl", e.target.value)}
                  placeholder="https://example.com/animation.gif"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailerUrl" className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  URL del Trailer
                </Label>
                <Input
                  id="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={(e) => handleInputChange("trailerUrl", e.target.value)}
                  placeholder="https://example.com/trailer.mp4"
                />
              </div>
            </div>
            {isBookOrMagazine && (
              <div className="space-y-2">
                <Label htmlFor="pdfUrl" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  URL del PDF
                </Label>
                <Input
                  id="pdfUrl"
                  value={formData.pdfUrl || ""}
                  onChange={(e) => handleInputChange("pdfUrl", e.target.value)}
                  placeholder="https://drive.google.com/file/d/ID-DEL-ARCHIVO/view"
                />
                {formData.pdfUrl &&
                  formData.pdfUrl.includes("drive.google.com") &&
                  !formData.pdfUrl.includes("uc?export=download") && (
                    <p className="text-xs text-green-600 mt-1">
                      ✔ El enlace de Drive será convertido automáticamente para descarga directa
                    </p>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
        {isToolkitOrEkids && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    {getCategoryIcon()}
                    {getSectionTitle()}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{getSectionDescription()}</p>
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
                            Título de la Sección *
                          </Label>
                          <Input
                            value={section.title}
                            onChange={(e) => handleSectionChange(index, "title", e.target.value)}
                            placeholder="Ej: Introducción al tema"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {section.fileUrl &&
                              section.fileUrl.includes("drive.google.com") &&
                              !section.fileUrl.includes("uc?export=download") && (
                                <p className="text-xs text-green-600">
                                  ✔ El enlace de Drive será convertido automáticamente
                                </p>
                              )}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="flex items-center">
                              <Link className="h-4 w-4 mr-2" />
                              URL de Descarga (opcional)
                            </Label>
                            <Input
                              value={section.downloadUrl || ""}
                              onChange={(e) => handleSectionChange(index, "downloadUrl", e.target.value)}
                              placeholder="https://drive.google.com/file/d/ID-DEL-ARCHIVO/view"
                            />
                            {section.downloadUrl &&
                              section.downloadUrl.includes("drive.google.com") &&
                              !section.downloadUrl.includes("uc?export=download") && (
                                <p className="text-xs text-green-600">
                                  ✔ El enlace de Drive será convertido automáticamente
                                </p>
                              )}
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
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Plus className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="font-medium text-lg mb-2">No hay secciones agregadas</p>
                  <p className="text-sm mb-4">
                    {formData.category === "e-kit"
                      ? "Los productos e-kit necesitan contenido organizado en secciones"
                      : "Los toolkits necesitan contenido organizado en secciones"}
                  </p>
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
