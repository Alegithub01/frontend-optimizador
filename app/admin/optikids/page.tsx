"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PlusCircle, Edit, Trash } from "lucide-react"
import type { Optikids } from "@/types/optikids"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

export default function OptikidsListPage() {
  const [optikidsList, setOptikidsList] = useState<Optikids[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOptikids = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<Optikids[]>("/optikids")
      setOptikidsList(data)
    } catch (err: any) {
      setError(err.message || "Error al cargar la lista de Optikids.")
      toast({
        title: "Error",
        description: err.message || "Error al cargar la lista de Optikids.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOptikids()
  }, [])

  const handleDeleteOptikids = async (id: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este Optikids y todas sus lecciones asociadas?")) {
      return
    }
    try {
      await api.delete(`/optikids/${id}`)
      toast({ title: "Optikids eliminado", description: "El Optikids ha sido eliminado exitosamente." })
      fetchOptikids() // Re-fetch the list
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Hubo un error al eliminar Optikids.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando Optikids...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Lista de Optikids</h1>
        <Link href="/admin/optikids/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Crear Nuevo Optikids
          </Button>
        </Link>
      </div>

      {optikidsList.length === 0 ? (
        <p className="text-center text-muted-foreground">No hay Optikids disponibles. ¡Crea uno nuevo!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {optikidsList.map((optikids) => (
            <Card key={optikids.id}>
              <CardHeader>
                <CardTitle>{optikids.name}</CardTitle>
                <CardDescription>{optikids.descripcion1}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Bandera: {optikids.bandera}</p>
                {optikids.lessons && optikids.lessons.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-2">Lecciones: {optikids.lessons.length}</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Link href={`/admin/optikids/${optikids.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Editar
                  </Button>
                </Link>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteOptikids(optikids.id)}>
                  <Trash className="mr-2 h-4 w-4" /> Eliminar
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
