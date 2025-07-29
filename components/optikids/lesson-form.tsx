"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Trash, Save } from "lucide-react"
import type { Lesson, CreateLessonDto, UpdateLessonDto } from "@/types/optikids"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface LessonFormProps {
  initialLesson?: Lesson
  optikidsId: number
  onSaveSuccess: (savedLesson: Lesson, tempId?: string) => void // Now passes the saved lesson
  onDeleteSuccess: (lessonId: number | string) => void
  isNew?: boolean // Prop to indicate if this is a newly added lesson in the UI
}

export function LessonForm({
  initialLesson,
  optikidsId,
  onSaveSuccess,
  onDeleteSuccess,
  isNew = false,
}: LessonFormProps) {
  const [lessonData, setLessonData] = useState<Partial<Lesson>>(initialLesson || { optikidsId })
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(isNew) // Start in editing mode if it's a new lesson

  useEffect(() => {
    setLessonData(initialLesson || { optikidsId })
    setIsEditing(isNew)
  }, [initialLesson, optikidsId, isNew])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setLessonData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const isNewLessonInForm = typeof lessonData.id === "string" && String(lessonData.id).startsWith("new-")
      let savedLesson: Lesson
      let tempId: string | undefined

      if (!isNewLessonInForm && typeof lessonData.id === "number") {
        // Update existing lesson
        savedLesson = await api.patch<Lesson>(`/optikids/lessons/${lessonData.id}`, lessonData as UpdateLessonDto)
        toast({ title: "Lección actualizada", description: "La lección ha sido actualizada exitosamente." })
      } else {
        // Create new lesson
        if (!optikidsId) {
          throw new Error("Optikids ID es requerido para crear una lección.")
        }
        tempId = lessonData.id as string // Capture the temporary ID

        // IMPORTANT: Omit the 'id' field when creating a new lesson
        const { id, ...dataToCreate } = lessonData
        // Limpia campos vacíos ("") para que no violen el DTO
        const cleanedData = Object.fromEntries(
        Object.entries({ ...dataToCreate, optikidsId }).filter(
            ([_, value]) => value !== ""
        )
        ) as unknown as CreateLessonDto

        savedLesson = await api.post<Lesson>("/optikids/lessons", cleanedData as CreateLessonDto)

        toast({ title: "Lección creada", description: "La nueva lección ha sido creada exitosamente." })
      }
      setLessonData(savedLesson)
      onSaveSuccess(savedLesson, tempId) // Pass tempId if it was a new lesson
      setIsEditing(false)

      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar la lección.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    // If it's a new lesson (temporary ID), just remove it from the UI
    if (typeof lessonData.id === "string" && String(lessonData.id).startsWith("new-")) {
      onDeleteSuccess(lessonData.id)
      return
    }

    // For existing lessons, call the API
    if (typeof lessonData.id !== "number") {
      // Ensure it's a valid numeric ID for deletion
      toast({ title: "Error", description: "ID de lección inválido para eliminar.", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      await api.delete(`/optikids/lessons/${lessonData.id}`)
      toast({ title: "Lección eliminada", description: "La lección ha sido eliminada exitosamente." })
      onDeleteSuccess(lessonData.id) // Notify parent to remove from list
      window.location.reload()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al eliminar la lección.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">
          {isNew ? "Nueva Lección" : lessonData.titulo || "Lección sin título"}
        </CardTitle>
        {!isNew && !isEditing && (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="etiqueta">Etiqueta</Label>
              <Input id="etiqueta" name="etiqueta" value={lessonData.etiqueta || ""} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título</Label>
              <Input id="titulo" name="titulo" value={lessonData.titulo || ""} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                name="descripcion"
                value={lessonData.descripcion || ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urlAndroid">URL Android</Label>
              <Input id="urlAndroid" name="urlAndroid" value={lessonData.urlAndroid || ""} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urlIos">URL iOS</Label>
              <Input id="urlIos" name="urlIos" value={lessonData.urlIos || ""} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urlVideo">URL Video</Label>
              <Input id="urlVideo" name="urlVideo" value={lessonData.urlVideo || ""} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urlSnap">URL Snap</Label>
              <Input id="urlSnap" name="urlSnap" value={lessonData.urlSnap || ""} onChange={handleChange} />
            </div>
          </div>
        ) : (
          <div className="grid gap-2 text-sm">
            <p>
              <strong>Etiqueta:</strong> {lessonData.etiqueta}
            </p>
            <p>
              <strong>Título:</strong> {lessonData.titulo}
            </p>
            {lessonData.descripcion && (
              <p>
                <strong>Descripción:</strong> {lessonData.descripcion}
              </p>
            )}
            {lessonData.urlAndroid && (
              <p>
                <strong>URL Android:</strong>{" "}
                <a
                  href={lessonData.urlAndroid}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlAndroid}
                </a>
              </p>
            )}
            {lessonData.urlIos && (
              <p>
                <strong>URL iOS:</strong>{" "}
                <a
                  href={lessonData.urlIos}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlIos}
                </a>
              </p>
            )}
            {lessonData.urlVideo && (
              <p>
                <strong>URL Video:</strong>{" "}
                <a
                  href={lessonData.urlVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlVideo}
                </a>
              </p>
            )}
            {lessonData.urlSnap && (
              <p>
                <strong>URL Snap:</strong>{" "}
                <a
                  href={lessonData.urlSnap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlSnap}
                </a>
              </p>
            )}
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false)
              // If it was a new lesson and cancelled, remove it from the parent's list
              if (isNew && typeof lessonData.id === "string" && String(lessonData.id).startsWith("new-")) {
                onDeleteSuccess(lessonData.id!)
              } else {
                // Otherwise, revert to initial data
                setLessonData(initialLesson || { optikidsId })
              }
            }}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" /> {loading ? "Guardando..." : "Guardar Lección"}
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            <Trash className="mr-2 h-4 w-4" /> {loading ? "Eliminando..." : "Eliminar Lección"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
