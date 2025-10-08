"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusCircle, Trash2, Plus, Minus, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast" // Import useToast

// Función para transformar URLs de Google Drive
const transformDriveUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined

  // Si ya es un enlace de descarga directa, no hacer nada
  if (url.includes("uc?export=download")) return url

  // Extraer el ID del archivo de diferentes formatos de URL de Drive
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/,
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

// Esquema de validación basado en los DTOs del backend
const contentSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "El título es requerido"),
  type: z.enum(["video", "pdf", "image"], {
    required_error: "Selecciona un tipo de contenido",
  }),
  urlOrText: z.string().min(1, "La URL o texto es requerido"),
  secondaryUrl: z.string().optional(),
  imageGenerator: z.boolean().default(false),
  music: z.boolean().default(false),
  selectedVideo: z.boolean().default(false),
})

const sectionSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(1, "El título es requerido"),
  temario: z.string().optional(),
  contents: z.array(contentSchema).min(1, "Debe haber al menos un contenido"),
})

const courseSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0"),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  isFree: z.boolean().default(false),
  image: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  capacity: z.coerce.number().min(1, "La capacidad debe ser al menos 1"),
  trailer: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  sections: z.array(sectionSchema).min(1, "Debe haber al menos una sección"),
})

type CourseFormValues = z.infer<typeof courseSchema>

// Definimos los tipos para los datos que vienen de la API
type ContentType = {
  id?: number
  title: string
  type: "video" | "pdf" | "image"
  urlOrText: string
  secondaryUrl?: string
  imageGenerator?: boolean
  music?: boolean
  selectedVideo?: boolean
}

type SectionType = {
  id?: number
  title: string
  temario?: string
  contents: ContentType[]
}

type CourseType = {
  id: number
  title: string
  description: string
  price: number
  discount: number
  isFree?: boolean
  image?: string
  startDate: string
  endDate: string
  capacity: number
  trailer?: string
  sections: SectionType[]
}

type CourseFormProps = {
  courseId?: string
}

// Componente para una sección individual
function SectionItem({
  sectionIndex,
  control,
  remove,
  canDelete,
}: {
  sectionIndex: number
  control: any
  remove: (index: number) => void
  canDelete: boolean
}) {
  const {
    fields: contentFields,
    append: appendContent,
    remove: removeContent,
  } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.contents`,
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Sección {sectionIndex + 1}</CardTitle>
        {canDelete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(sectionIndex)}
            className="text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={control}
          name={`sections.${sectionIndex}.title`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la sección</FormLabel>
              <FormControl>
                <Input placeholder="Título de la sección" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={`sections.${sectionIndex}.temario`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Temario</FormLabel>
              <FormControl>
                <Textarea placeholder="Temario de la sección" className="min-h-[80px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Contenidos</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendContent({
                  title: "",
                  type: "video",
                  urlOrText: "",
                  imageGenerator: false,
                  music: false,
                  selectedVideo: false,
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar Contenido
            </Button>
          </div>

          {contentFields.map((contentField, contentIndex) => (
            <div key={contentField.id} className="border rounded-md p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Contenido {contentIndex + 1}</h4>
                {contentFields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeContent(contentIndex)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name={`sections.${sectionIndex}.contents.${contentIndex}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Título del contenido" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name={`sections.${sectionIndex}.contents.${contentIndex}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="image">Imagen</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name={`sections.${sectionIndex}.contents.${contentIndex}.urlOrText`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL o Texto</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          control._formValues.sections[sectionIndex].contents[contentIndex].type === "pdf"
                            ? "https://drive.google.com/file/d/ID-DEL-ARCHIVO/view"
                            : "URL o texto del contenido"
                        }
                        {...field}
                      />
                    </FormControl>
                    {control._formValues.sections[sectionIndex].contents[contentIndex].type === "pdf" && (
                      <FormDescription>
                        {field.value &&
                          field.value.includes("drive.google.com") &&
                          !field.value.includes("uc?export=download") && (
                            <span className="text-green-600">✔ El enlace de Drive será convertido automáticamente</span>
                          )}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`sections.${sectionIndex}.contents.${contentIndex}.secondaryUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Secundaria (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          control._formValues.sections[sectionIndex].contents[contentIndex].type === "pdf"
                            ? "https://drive.google.com/file/d/ID-DEL-ARCHIVO/view"
                            : "URL secundaria (opcional)"
                        }
                        {...field}
                      />
                    </FormControl>
                    {control._formValues.sections[sectionIndex].contents[contentIndex].type === "pdf" && (
                      <FormDescription>
                        {field.value &&
                          field.value.includes("drive.google.com") &&
                          !field.value.includes("uc?export=download") && (
                            <span className="text-green-600">✔ El enlace de Drive será convertido automáticamente</span>
                          )}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <h5 className="text-sm font-medium text-gray-700">Características del contenido</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name={`sections.${sectionIndex}.contents.${contentIndex}.imageGenerator`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Generador de Imágenes</FormLabel>
                          <FormDescription className="text-xs">Habilitar generación de imágenes</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`sections.${sectionIndex}.contents.${contentIndex}.music`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Música</FormLabel>
                          <FormDescription className="text-xs">Incluir funcionalidad de música</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name={`sections.${sectionIndex}.contents.${contentIndex}.selectedVideo`}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm">Video Seleccionado</FormLabel>
                          <FormDescription className="text-xs">Marcar como video destacado</FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseForm({ courseId }: CourseFormProps) {
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(!!courseId)
  const { toast } = useToast() // Declare useToast
  const router = useRouter()

  // Estado para el botón de guardar independiente
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      discount: 0,
      isFree: false,
      image: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      capacity: 20,
      trailer: "",
      sections: [
        {
          title: "",
          temario: "",
          contents: [
            {
              title: "",
              type: "video",
              urlOrText: "",
              imageGenerator: false,
              music: false,
              selectedVideo: false,
            },
          ],
        },
      ],
    },
  })

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control: form.control,
    name: "sections",
  })

  // Cargar datos del curso si estamos en modo edición
  useEffect(() => {
    if (!courseId) return

    const formatDate = (date?: string | Date, fallbackDays = 0) => {
      const d = date ? new Date(date) : new Date(Date.now() + fallbackDays * 86400000)
      return d.toISOString().split("T")[0]
    }

    const fetchCourse = async () => {
      try {
        setLoading(true)
        console.log("Cargando curso con ID:", courseId)

        const course = await api.get<CourseType>(`/courses/${courseId}`)
        if (!course || typeof course !== "object") throw new Error("Curso no válido")

        const formattedCourse = {
          title: course.title || "",
          description: course.description || "",
          price: isNaN(Number(course.price)) ? 0 : Number(course.price),
          discount: course.discount || 0,
          isFree: course.isFree || false,
          image: course.image || "",
          startDate: formatDate(course.startDate),
          endDate: formatDate(course.endDate, 30),
          capacity: course.capacity || 20,
          trailer: course.trailer || "",
          sections: Array.isArray(course.sections)
            ? course.sections.map((section: SectionType) => ({
                id: section.id,
                title: section.title || "",
                temario: section.temario || "",
                contents: Array.isArray(section.contents)
                  ? section.contents.map((content) => ({
                      id: content?.id ?? undefined,
                      title: content?.title || "",
                      type: content?.type || "video",
                      urlOrText:
                        content?.type === "pdf" ? transformDriveUrl(content.urlOrText) || "" : content?.urlOrText || "",
                      secondaryUrl:
                        content?.type === "pdf"
                          ? transformDriveUrl(content.secondaryUrl) || ""
                          : content?.secondaryUrl || "",
                      imageGenerator: content?.imageGenerator || false,
                      music: content?.music || false,
                      selectedVideo: content?.selectedVideo || false,
                    }))
                  : [
                      {
                        title: "",
                        type: "video" as const,
                        urlOrText: "",
                        imageGenerator: false,
                        music: false,
                        selectedVideo: false,
                      },
                    ],
              }))
            : [],
        }

        form.reset(formattedCourse)
        console.log("Formulario actualizado con éxito")
      } catch (error) {
        console.error("Error al cargar el curso:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el curso",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, form, toast])

  // Función para guardar directamente sin usar el formulario
  const saveDirectly = async () => {
    try {
      setIsSaving(true)

      // Mostrar toast de carga
      toast({
        title: isEditing ? "Actualizando curso..." : "Creando curso...",
        description: "Por favor espera mientras se procesa la solicitud",
      })

      // Obtener los datos del formulario
      const formData = form.getValues()

      // Transformar URLs de Drive para todos los PDFs
      const transformedData = {
        ...formData,
        sections: formData.sections.map((section) => ({
          ...section,
          contents: section.contents.map((content) => ({
            ...content,
            urlOrText:
              content.type === "pdf" ? transformDriveUrl(content.urlOrText) || content.urlOrText : content.urlOrText,
            secondaryUrl:
              content.type === "pdf" && content.secondaryUrl
                ? transformDriveUrl(content.secondaryUrl)
                : content.secondaryUrl,
          })),
        })),
      }

      console.log("Datos a enviar:", JSON.stringify(transformedData, null, 2))

      // URL base de la API
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

      // Configurar la petición según sea crear o actualizar
      const url = isEditing ? `${apiUrl}/courses/${courseId}` : `${apiUrl}/courses`
      const method = isEditing ? "PATCH" : "POST"

      console.log(`Enviando ${method} a ${url}`)

      // Realizar la petición directamente con fetch
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transformedData),
      })

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        // Intentar obtener el mensaje de error
        let errorMessage = "Error en la petición"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Si no se puede parsear como JSON, usar el texto
          errorMessage = await response.text()
        }

        throw new Error(`Error ${response.status}: ${errorMessage}`)
      }

      // Parsear la respuesta
      const result = await response.json()
      console.log("Respuesta exitosa:", result)

      // Mostrar mensaje de éxito
      toast({
        title: "¡Éxito!",
        description: isEditing ? "Curso actualizado correctamente" : "Curso creado correctamente",
      })

      // Redirigir después de un breve retraso
      setTimeout(() => {
        const id = isEditing ? courseId : result.id
        window.location.href = `/admin/cursos/${id}`
      }, 1000)
    } catch (error: any) {
      console.error("Error al guardar:", error)

      // Mostrar mensaje de error
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Título del curso" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Curso Gratis</FormLabel>
                        <FormDescription>Marcar si el curso es gratuito</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{form.watch("isFree") ? "Precio (GRATIS)" : "Precio"}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...field}
                          disabled={form.watch("isFree")}
                          value={form.watch("isFree") ? "0" : field.value}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="discount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descuento (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" max="100" step="1" {...field} />
                  </FormControl>
                  <FormDescription>Porcentaje de descuento del curso (0 a 100)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descripción del curso" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de fin</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidad</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                    </FormControl>
                    <FormDescription>URL de la imagen principal del curso</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="trailer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del trailer</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/embed/..." {...field} />
                  </FormControl>
                  <FormDescription>URL del video de presentación del curso</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Secciones del Curso</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendSection({
                  title: "",
                  temario: "",
                  contents: [
                    {
                      title: "",
                      type: "video",
                      urlOrText: "",
                      imageGenerator: false,
                      music: false,
                      selectedVideo: false,
                    },
                  ],
                })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Agregar Sección
            </Button>
          </div>

          {sectionFields.map((sectionField, sectionIndex) => (
            <SectionItem
              key={sectionField.id}
              sectionIndex={sectionIndex}
              control={form.control}
              remove={removeSection}
              canDelete={sectionFields.length > 1}
            />
          ))}
        </div>

        {/* Botón de guardar independiente y destacado */}
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            onClick={saveDirectly}
            disabled={isSaving}
            size="lg"
            className="bg-green-600 hover:bg-green-700 shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar Curso"
            ) : (
              "Crear Curso"
            )}
          </Button>
        </div>

        <div className="flex justify-end gap-4 pb-20">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="button" onClick={saveDirectly} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar Curso"
            ) : (
              "Crear Curso"
            )}
          </Button>
        </div>
      </div>
    </Form>
  )
}
