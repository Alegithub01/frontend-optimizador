"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Edit, MapPin, Calendar, Users, DollarSign, Loader2 } from "lucide-react"

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

export function EventDetail({ id }: { id: string }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"

        console.log("Fetching event details from:", `${apiUrl}/event/${id}`)
        const response = await fetch(`${apiUrl}/event/${id}`)

        if (!response.ok) {
          throw new Error(`Error al cargar evento: ${response.status}`)
        }

        const data = await response.json()
        console.log("Evento cargado:", data)

        setEvent(data)
      } catch (error) {
        console.error("Error al cargar evento:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el evento",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [id, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Cargando detalles del evento...</span>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-4">Evento no encontrado</h2>
        <p className="mb-6">No se pudo encontrar el evento solicitado.</p>
        <Button asChild>
          <Link href="/admin/eventos">Volver a la lista de eventos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{event.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/admin/eventos/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Información del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">Descripción</h3>
                <p className="mt-1">{event.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Fecha y Hora</h3>
                    <p className="mt-1">{new Date(event.dateTime).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Ubicación</h3>
                    <p className="mt-1">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Capacidad</h3>
                    <p className="mt-1">{event.capacity} personas</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground">Precio</h3>
                    <p className="mt-1">${event.price}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-2">Temas</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(event.topics) &&
                    event.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary">
                        {topic}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagen del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
              <Image
                src={event.image || "https://via.placeholder.com/800x400?text=Imagen+del+Evento"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="logos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="logos">Logos</TabsTrigger>
          {event.trailerUrl && <TabsTrigger value="trailer">Trailer</TabsTrigger>}
        </TabsList>

        <TabsContent value="logos">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo Principal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-square w-full overflow-hidden rounded-md">
                  <Image
                    src={event.logo || "https://via.placeholder.com/200x200?text=Logo"}
                    alt="Logo principal"
                    fill
                    className="object-contain"
                  />
                </div>
              </CardContent>
            </Card>

            {event.logo1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Logo 1</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image src={event.logo1 || "/placeholder.svg"} alt="Logo 1" fill className="object-contain" />
                  </div>
                </CardContent>
              </Card>
            )}

            {event.logo2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Logo 2</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image src={event.logo2 || "/placeholder.svg"} alt="Logo 2" fill className="object-contain" />
                  </div>
                </CardContent>
              </Card>
            )}

            {event.logo3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Logo 3</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image src={event.logo3 || "/placeholder.svg"} alt="Logo 3" fill className="object-contain" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {event.trailerUrl && (
          <TabsContent value="trailer">
            <Card>
              <CardContent className="pt-6">
                <div className="aspect-video w-full">
                  <iframe src={event.trailerUrl} className="w-full h-full rounded-md" allowFullScreen />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
