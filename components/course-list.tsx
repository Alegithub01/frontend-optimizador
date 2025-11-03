"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Edit, MoreVertical, Trash2, Eye, Save } from "lucide-react"
import { api } from "@/lib/api"

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
  order?: number
}

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [editingOrderId, setEditingOrderId] = useState<number | null>(null)
  const [orderValue, setOrderValue] = useState<number | null>(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await api.get<Course[]>("/courses")
        // ❌ no reordenamos por id; ya viene ordenado por 'order' desde el backend
        setCourses(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los cursos",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [toast])

  const handleDelete = async () => {
    if (deleteId === null) return

    try {
      await api.delete(`/courses/${deleteId}`)
      setCourses(courses.filter((course) => course.id !== deleteId))
      toast({
        title: "Éxito",
        description: "Curso eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const confirmDelete = (id: number) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  const startEditOrder = (course: Course) => {
    setEditingOrderId(course.id)
    setOrderValue(course.order ?? 0)
  }

  const saveOrder = async (id: number) => {
    try {
      await api.patch(`/courses/${id}`, { order: orderValue })
      setCourses((prev) =>
        prev.map((c) => (c.id === id ? { ...c, order: orderValue ?? c.order } : c))
      )
      toast({ title: "Orden actualizado", description: `El curso fue movido al orden ${orderValue}` })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el orden",
        variant: "destructive",
      })
    } finally {
      setEditingOrderId(null)
    }
  }

  if (loading) {
    return <div>Cargando cursos...</div>
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Fecha Inicio</TableHead>
              <TableHead>Fecha Fin</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No hay cursos disponibles
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.id}</TableCell>

                  {/* ✅ COLUMNA DE ORDEN */}
                  <TableCell>
                    {editingOrderId === course.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={orderValue ?? ""}
                          onChange={(e) => setOrderValue(Number(e.target.value))}
                          className="w-16"
                        />
                        <Button size="icon" onClick={() => saveOrder(course.id)}>
                          <Save className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{course.order ?? 0}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => startEditOrder(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>

                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>${course.price}</TableCell>
                  <TableCell>{course.capacity}</TableCell>
                  <TableCell>{new Date(course.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(course.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/cursos/${course.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/cursos/${course.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(course.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente este curso y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
