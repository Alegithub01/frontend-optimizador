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
import { useToast } from "@/hooks/use-toast"
import { Edit, MoreVertical, Trash2, Eye, Loader2 } from "lucide-react"

type Event = {
  id: string
  title: string
  description: string
  dateTime: string
  location: string
  image: string
  logo: string
  capacity: number
  price: number
  topics: string[]
  logo1?: string
  logo2?: string
  logo3?: string
  trailerUrl?: string
}

export function EventList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

        console.log("Fetching events from:", `${apiUrl}/event`)
        const response = await fetch(`${apiUrl}/event`)

        if (!response.ok) {
          throw new Error(`Error al cargar eventos: ${response.status}`)
        }

        const data = await response.json()
        console.log("Eventos cargados:", data)

        // Asegurarse de que data es un array
        const eventsArray = Array.isArray(data) ? data : []
        setEvents(eventsArray)
      } catch (error) {
        console.error("Error al cargar eventos:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los eventos",
          variant: "destructive",
        })
        // Si hay un error, establecer un array vacío
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [toast])

  const handleDelete = async () => {
    if (deleteId === null) return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const response = await fetch(`${apiUrl}/event/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar evento: ${response.status}`)
      }

      setEvents(events.filter((event) => event.id !== deleteId))
      toast({
        title: "Éxito",
        description: "Evento eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar evento:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el evento",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const confirmDelete = (id: string) => {
    setDeleteId(id)
    setIsDeleteDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando eventos...</span>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Ubicación</TableHead>
              <TableHead>Capacidad</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No hay eventos disponibles
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{new Date(event.dateTime).toLocaleString()}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>{event.capacity}</TableCell>
                  <TableCell>${event.price}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Abrir menú</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/admin/eventos/${event.id}`)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/admin/eventos/${event.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => confirmDelete(event.id)}
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
              Esta acción no se puede deshacer. Se eliminará permanentemente este evento y todos sus datos asociados.
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
