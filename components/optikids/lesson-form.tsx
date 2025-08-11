"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Trash, Save, X } from "lucide-react" // Added X icon for delete buttons
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
  const [androidFile, setAndroidFile] = useState<File | null>(null)
  const [iosFile, setIosFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(isNew) // Start in editing mode if it's a new lesson
  const [deleteAndroidFile, setDeleteAndroidFile] = useState(false)
  const [deleteIosFile, setDeleteIosFile] = useState(false)

  useEffect(() => {
    setLessonData(initialLesson || { optikidsId })
    setIsEditing(isNew)
    // Clear file inputs when initialLesson changes or it's a new lesson
    setAndroidFile(null)
    setIosFile(null)
    setDeleteAndroidFile(false)
    setDeleteIosFile(false)
  }, [initialLesson, optikidsId, isNew])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement // Cast to HTMLInputElement for files
    if (files && files.length > 0) {
      if (name === "androidFile") {
        setAndroidFile(files[0])
        setDeleteAndroidFile(false)
      } else if (name === "iosFile") {
        setIosFile(files[0])
        setDeleteIosFile(false)
      }
    } else {
      setLessonData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const uploadFile = useCallback(async (file: File, oldFilePath: string | null): Promise<string | null> => {
    if (!file) return null

    const formData = new FormData()
    formData.append("file", file)
    if (oldFilePath) {
      formData.append("oldFilePath", oldFilePath)
    }

    const res = await fetch("/api/files", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.error || "Failed to upload file.")
    }

    const data = await res.json()
    return data.filePath
  }, [])

  const deleteFile = useCallback(async (filePath: string) => {
    if (!filePath) return

    const res = await fetch("/api/files", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filePath }),
    })

    if (!res.ok) {
      const errorData = await res.json()
      console.error(`Failed to delete file ${filePath}:`, errorData)
      // Don't throw error here, as it might be an optional file or already gone
    } else {
      console.log(`File ${filePath} deleted successfully.`)
    }
  }, [])

  const handleDeleteExistingFile = async (fileType: "android" | "ios") => {
    setLoading(true)
    try {
      const filePath = fileType === "android" ? lessonData.urlAndroid : lessonData.urlIos
      if (filePath) {
        // Delete file from server
        await deleteFile(filePath)

        const updatedLessonData = {
          ...lessonData,
          [fileType === "android" ? "urlAndroid" : "urlIos"]: null,
        }

        // Update in database immediately if it's an existing lesson
        if (typeof lessonData.id === "number") {
          const savedLesson = await api.patch<Lesson>(
            `/optikids/lessons/${lessonData.id}`,
            updatedLessonData as UpdateLessonDto,
          )
          setLessonData(savedLesson)
        } else {
          // For new lessons, just update local state
          setLessonData(updatedLessonData)
        }

        // Set delete flag for UI feedback
        if (fileType === "android") {
          setDeleteAndroidFile(true)
        } else {
          setDeleteIosFile(true)
        }

        toast({
          title: "Archivo eliminado",
          description: `El archivo ${fileType === "android" ? "Android" : "iOS"} ha sido eliminado exitosamente de la base de datos.`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || `Hubo un error al eliminar el archivo ${fileType === "android" ? "Android" : "iOS"}.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updatedLessonData = { ...lessonData } as Partial<Lesson>

      // Upload Android file if selected
      if (androidFile) {
        const newAndroidPath = await uploadFile(androidFile, initialLesson?.urlAndroid || null)
        updatedLessonData.urlAndroid = newAndroidPath || undefined
      } else if (deleteAndroidFile || (initialLesson && !androidFile && lessonData.urlAndroid === "")) {
        if (initialLesson?.urlAndroid && !deleteAndroidFile) {
          await deleteFile(initialLesson.urlAndroid)
        }
        updatedLessonData.urlAndroid = undefined // Set to undefined to clear in DB
      }

      // Upload iOS file if selected
      if (iosFile) {
        const newIosPath = await uploadFile(iosFile, initialLesson?.urlIos || null)
        updatedLessonData.urlIos = newIosPath || undefined
      } else if (deleteIosFile || (initialLesson && !iosFile && lessonData.urlIos === "")) {
        if (initialLesson?.urlIos && !deleteIosFile) {
          await deleteFile(initialLesson.urlIos)
        }
        updatedLessonData.urlIos = undefined // Set to undefined to clear in DB
      }

      const isNewLessonInForm = typeof lessonData.id === "string" && String(lessonData.id).startsWith("new-")

      let savedLesson: Lesson
      let tempId: string | undefined

      if (!isNewLessonInForm && typeof lessonData.id === "number") {
        // Update existing lesson
        savedLesson = await api.patch<Lesson>(
          `/optikids/lessons/${lessonData.id}`,
          updatedLessonData as UpdateLessonDto,
        )
        toast({ title: "Lección actualizada", description: "La lección ha sido actualizada exitosamente." })
      } else {
        // Create new lesson
        if (!optikidsId) {
          throw new Error("Optikids ID es requerido para crear una lección.")
        }
        tempId = lessonData.id as string // Capture the temporary ID
        // IMPORTANT: Omit the 'id' field when creating a new lesson
        const { id, ...dataToCreate } = updatedLessonData
        // Limpia campos vacíos ("") para que no violen el DTO
        const cleanedData = Object.fromEntries(
          Object.entries({ ...dataToCreate, optikidsId }).filter(
            ([_, value]) => value !== "" && value !== null, // Also filter out nulls from file uploads if no file was selected
          ),
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
      // Delete associated files first
      if (lessonData.urlAndroid) {
        await deleteFile(lessonData.urlAndroid)
      }
      if (lessonData.urlIos) {
        await deleteFile(lessonData.urlIos)
      }

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
              <Label htmlFor="urlBg">URL Background</Label>
              <Input id="urlBg" name="urlBg" value={lessonData.urlBg || ""} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urlImage">URL Imagen</Label>
              <Input id="urlImage" name="urlImage" value={lessonData.urlImage || ""} onChange={handleChange} />
            </div>

            {/* File input for Android */}
            <div className="grid gap-2">
              <Label htmlFor="androidFile">Archivo Android</Label>
              <Input
                id="androidFile"
                name="androidFile"
                type="file"
                onChange={handleChange}
                className="cursor-pointer"
              />
              {lessonData.urlAndroid && !androidFile && !deleteAndroidFile && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-500">
                    Archivo actual:{" "}
                    <a href={lessonData.urlAndroid} target="_blank" rel="noopener noreferrer" className="underline">
                      {lessonData.urlAndroid.split("/").pop()}
                    </a>
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteExistingFile("android")}
                    className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600"
                    title="Eliminar archivo Android"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {androidFile && <p className="text-xs text-gray-500">Nuevo archivo seleccionado: {androidFile.name}</p>}
              {deleteAndroidFile && <p className="text-xs text-red-500 font-medium">✓ Archivo Android eliminado</p>}
            </div>

            {/* File input for iOS */}
            <div className="grid gap-2">
              <Label htmlFor="iosFile">Archivo iOS</Label>
              <Input id="iosFile" name="iosFile" type="file" onChange={handleChange} className="cursor-pointer" />
              {lessonData.urlIos && !iosFile && !deleteIosFile && (
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                  <p className="text-xs text-gray-500">
                    Archivo actual:{" "}
                    <a href={lessonData.urlIos} target="_blank" rel="noopener noreferrer" className="underline">
                      {lessonData.urlIos.split("/").pop()}
                    </a>
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteExistingFile("ios")}
                    className="h-7 w-7 p-0 bg-red-500 hover:bg-red-600"
                    title="Eliminar archivo iOS"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              {iosFile && <p className="text-xs text-gray-500">Nuevo archivo seleccionado: {iosFile.name}</p>}
              {deleteIosFile && <p className="text-xs text-red-500 font-medium">✓ Archivo iOS eliminado</p>}
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
            {lessonData.urlBg && (
              <p>
                <strong>URL Background:</strong>{" "}
                <a
                  href={lessonData.urlBg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlBg}
                </a>
              </p>
            )}
            {lessonData.urlImage && (
              <p>
                <strong>URL Imagen:</strong>{" "}
                <a
                  href={lessonData.urlImage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlImage}
                </a>
              </p>
            )}
            {lessonData.urlAndroid && (
              <p>
                <strong>Archivo Android:</strong>{" "}
                <a
                  href={lessonData.urlAndroid}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlAndroid.split("/").pop()}
                </a>
              </p>
            )}
            {lessonData.urlIos && (
              <p>
                <strong>Archivo iOS:</strong>{" "}
                <a
                  href={lessonData.urlIos}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {lessonData.urlIos.split("/").pop()}
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
                setAndroidFile(null) // Clear file input state
                setIosFile(null) // Clear file input state
                setDeleteAndroidFile(false)
                setDeleteIosFile(false)
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
