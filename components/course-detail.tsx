"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Edit, Video, FileText, ImageIcon } from "lucide-react"
import { api } from "@/lib/api"

type Content = {
  id: number
  title: string
  type: "video" | "pdf" | "image"
  urlOrText: string
  secondaryUrl?: string
}

type Section = {
  id: number
  title: string
  temario?: string
  contents: Content[]
}

type Course = {
  id: number
  title: string
  description: string
  price: number
  image?: string
  startDate: string
  endDate: string
  capacity: number
  trailer?: string
  sections: Section[]
}

export function CourseDetail({ id }: { id: string }) {
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await api.get<Course>(`/courses/${id}`)
        setCourse(data)
      } catch (error) {
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
  }, [id, toast])

  if (loading) {
    return <div>Cargando detalles del curso...</div>
  }

  if (!course) {
    return <div>No se encontró el curso</div>
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "image":
        return <ImageIcon className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{course.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/cursos/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información del Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Descripción</h3>
                <p className="mt-1">{course.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Precio</h3>
                  <p className="mt-1">${course.price}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Capacidad</h3>
                  <p className="mt-1">{course.capacity} estudiantes</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Fecha de inicio</h3>
                  <p className="mt-1">{new Date(course.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">Fecha de fin</h3>
                  <p className="mt-1">{new Date(course.endDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagen del Curso</CardTitle>
          </CardHeader>
          <CardContent>
            {course.image ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-md">
                <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-md">
                <p className="text-muted-foreground">Sin imagen</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold mb-4">Contenido del Curso</h2>

      <Tabs defaultValue="sections" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="sections">Secciones</TabsTrigger>
          {course.trailer && <TabsTrigger value="trailer">Trailer</TabsTrigger>}
        </TabsList>

        <TabsContent value="sections">
          {course.sections.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Este curso no tiene secciones</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {course.sections.map((section, index) => (
                <Card key={section.id}>
                  <CardHeader>
                    <CardTitle>
                      Sección {index + 1}: {section.title}
                    </CardTitle>
                    {section.temario && <CardDescription>{section.temario}</CardDescription>}
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium mb-2">Contenidos</h3>
                    {section.contents.length === 0 ? (
                      <p className="text-muted-foreground">Esta sección no tiene contenidos</p>
                    ) : (
                      <ul className="space-y-2">
                        {section.contents.map((content) => (
                          <li key={content.id} className="flex items-center gap-2">
                            {getContentIcon(content.type)}
                            <span>{content.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {course.trailer && (
          <TabsContent value="trailer">
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-video w-full">
                  <iframe src={course.trailer} className="w-full h-full rounded-md" allowFullScreen />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
