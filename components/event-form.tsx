"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, X, Plus, Phone } from "lucide-react"

// Lista de países con códigos telefónicos
const countries = [
  { code: "BO", name: "Bolivia", dialCode: "+591" },
  { code: "AR", name: "Argentina", dialCode: "+54" },
  { code: "BR", name: "Brasil", dialCode: "+55" },
  { code: "CL", name: "Chile", dialCode: "+56" },
  { code: "CO", name: "Colombia", dialCode: "+57" },
  { code: "EC", name: "Ecuador", dialCode: "+593" },
  { code: "PE", name: "Perú", dialCode: "+51" },
  { code: "PY", name: "Paraguay", dialCode: "+595" },
  { code: "UY", name: "Uruguay", dialCode: "+598" },
  { code: "VE", name: "Venezuela", dialCode: "+58" },
  { code: "MX", name: "México", dialCode: "+52" },
  { code: "US", name: "Estados Unidos", dialCode: "+1" },
  { code: "ES", name: "España", dialCode: "+34" },
]

// Esquema de validación actualizado
const eventSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
  dateTime: z.string().min(1, "La fecha y hora de inicio son requeridas"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "El formato debe ser HH:MM"),
  location: z.string().min(1, "La ubicación es requerida"),
  image: z.string().url("Debe ser una URL válida"),
  logo: z.string().url("Debe ser una URL válida"),
  // Campos opcionales
  capacity: z.coerce.number().min(0, "La capacidad debe ser mayor o igual a 0").optional(),
  price: z.coerce.number().min(0, "El precio debe ser mayor o igual a 0").optional(),
  // WhatsApp
  countryCode: z.string().min(1, "Selecciona un país"),
  whatsappNumber: z.string().min(1, "El número de WhatsApp es requerido"),
  topics: z.array(z.string()).min(1, "Debe haber al menos un tema"),
  logo1: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  logo2: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  logo3: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
  trailerUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal("")),
})

type EventFormValues = z.infer<typeof eventSchema>

type Event = {
  id: string
  title: string
  description: string
  dateTime: string
  endTime: string
  location: string
  image: string
  logo: string
  capacity?: number
  price?: string | number
  whatsappNumber?: string
  topics: string[]
  logo1?: string
  logo2?: string
  logo3?: string
  trailerUrl?: string
}

type EventFormProps = {
  eventId?: string
}

export function EventForm({ eventId }: EventFormProps) {
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(!!eventId)
  const [newTopic, setNewTopic] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(countries[0]) // Bolivia por defecto
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      dateTime: new Date().toISOString().slice(0, 16),
      endTime: "13:00",
      location: "",
      image: "https://via.placeholder.com/800x400?text=Imagen+del+Evento",
      logo: "https://via.placeholder.com/200x200?text=Logo",
      capacity: undefined, // Opcional
      price: undefined, // Opcional
      countryCode: "BO", // Bolivia por defecto
      whatsappNumber: "",
      topics: ["Tema 1"],
      logo1: "",
      logo2: "",
      logo3: "",
      trailerUrl: "",
    },
  })

  // Función para extraer código de país y número del whatsappNumber completo
  const parseWhatsAppNumber = (fullNumber: string) => {
    if (!fullNumber) return { countryCode: "BO", number: "" }

    // Buscar el país que coincida con el inicio del número
    const country = countries.find((c) => fullNumber.startsWith(c.dialCode))
    if (country) {
      return {
        countryCode: country.code,
        number: fullNumber.substring(country.dialCode.length),
      }
    }

    // Si no encuentra coincidencia, usar Bolivia por defecto
    return { countryCode: "BO", number: fullNumber.replace(/^\+\d+/, "") }
  }

  // Cargar datos del evento si estamos en modo edición
  useEffect(() => {
    if (eventId) {
      const fetchEvent = async () => {
        try {
          setLoading(true)
          console.log("Cargando evento con ID:", eventId)
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
          const response = await fetch(`${apiUrl}/event/${eventId}`)
          if (!response.ok) {
            throw new Error(`Error al cargar el evento: ${response.status}`)
          }
          const event = await response.json()
          console.log("Datos recibidos de la API:", event)

          if (!event) throw new Error("Evento no encontrado")

          const utcDate = new Date(event.dateTime)
          const localDateTime = new Date(utcDate.getTime() - utcDate.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16)
          const dateTimeLocal = event.dateTime ? localDateTime : ""
          const endTimeFormatted = event.endTime ? event.endTime.substring(0, 5) : "13:00"

          // Parsear número de WhatsApp
          const { countryCode, number } = parseWhatsAppNumber(event.whatsappNumber || "")
          const country = countries.find((c) => c.code === countryCode) || countries[0]
          setSelectedCountry(country)

          const formattedEvent = {
            title: event.title || "",
            description: event.description || "",
            dateTime: dateTimeLocal,
            endTime: endTimeFormatted,
            location: event.location || "",
            image: event.image || "https://via.placeholder.com/800x400?text=Imagen+del+Evento",
            logo: event.logo || "https://via.placeholder.com/200x200?text=Logo",
            capacity: event.capacity
              ? typeof event.capacity === "string"
                ? Number.parseInt(event.capacity)
                : event.capacity
              : undefined,
            price: event.price
              ? typeof event.price === "string"
                ? Number.parseFloat(event.price)
                : event.price
              : undefined,
            countryCode: countryCode,
            whatsappNumber: number,
            topics: Array.isArray(event.topics) ? event.topics : ["Tema 1"],
            logo1: event.logo1 || "",
            logo2: event.logo2 || "",
            logo3: event.logo3 || "",
            trailerUrl: event.trailerUrl || "",
          }

          console.log("Datos formateados para el formulario:", formattedEvent)
          form.reset(formattedEvent)
          console.log("Formulario actualizado con éxito")
        } catch (error) {
          console.error("Error al cargar el evento:", error)
          toast({
            title: "Error",
            description: "No se pudo cargar el evento. Creando un nuevo evento.",
            variant: "destructive",
          })
          setIsEditing(false)
        } finally {
          setLoading(false)
        }
      }
      fetchEvent()
    }
  }, [eventId, form, toast])

  // Actualizar país seleccionado cuando cambia el código de país en el formulario
  useEffect(() => {
    const countryCode = form.watch("countryCode")
    const country = countries.find((c) => c.code === countryCode)
    if (country) {
      setSelectedCountry(country)
    }
  }, [form.watch("countryCode")])

  const addTopic = () => {
    if (!newTopic.trim()) return
    const currentTopics = form.getValues("topics") || []
    if (!currentTopics.includes(newTopic.trim())) {
      form.setValue("topics", [...currentTopics, newTopic.trim()])
    }
    setNewTopic("")
  }

  const removeTopic = (topicToRemove: string) => {
    const currentTopics = form.getValues("topics") || []
    form.setValue(
      "topics",
      currentTopics.filter((topic) => topic !== topicToRemove),
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTopic()
    }
  }

  const handleSaveClick = async () => {
    try {
      setLoading(true)

      const isValid = await form.trigger()
      if (!isValid) {
        console.log("Formulario inválido:", form.formState.errors)
        toast({
          title: "Error de validación",
          description: "Por favor, completa todos los campos requeridos correctamente",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      const data = form.getValues()

      // Validar formato de hora de fin (HH:MM)
      const timePattern = /^\d{2}:\d{2}$/
      if (!timePattern.test(data.endTime)) {
        toast({
          title: "Error",
          description: "El formato de hora de fin debe ser HH:MM (ejemplo: 13:00)",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Construir número completo de WhatsApp
      const fullWhatsAppNumber = `${selectedCountry.dialCode}${data.whatsappNumber}`

      const dateTimeISO = data.dateTime

      // Preparar datos para enviar al backend
      const dataToSend = {
        title: data.title,
        description: data.description,
        dateTime: dateTimeISO,
        endTime: data.endTime,
        location: data.location,
        image: data.image,
        logo: data.logo,
        // Campos opcionales - solo enviar si tienen valor
        ...(data.capacity !== undefined && { capacity: Number(data.capacity) }),
        ...(data.price !== undefined && { price: data.price.toString() }),
        whatsappNumber: fullWhatsAppNumber,
        topics: data.topics,
        logo1: data.logo1 || "",
        logo2: data.logo2 || "",
        logo3: data.logo3 || "",
        trailerUrl: data.trailerUrl || "",
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
      const url = isEditing ? `${apiUrl}/event/${eventId}` : `${apiUrl}/event`
      const method = isEditing ? "PATCH" : "POST"

      console.log(`Enviando ${method} a ${url}`)
      console.log("Datos a enviar:", dataToSend)

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      console.log("Respuesta del servidor:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error en la respuesta:", errorText)
        throw new Error(`Error ${response.status}: ${errorText}`)
      }

      const responseData = await response.json()
      console.log("Datos de respuesta:", responseData)

      toast({
        title: "¡Éxito!",
        description: isEditing ? "Evento actualizado correctamente" : "Evento creado correctamente",
      })

      setTimeout(() => {
        const id = isEditing ? eventId : responseData.id
        window.location.href = `/admin/eventos/${id}`
      }, 1000)
    } catch (error: any) {
      console.error("Error al guardar:", error)
      toast({
        title: "Error",
        description: error.message || "No se pudo procesar la solicitud",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título del evento" {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Descripción del evento" className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha y Hora de Inicio</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormDescription>Fecha y hora de inicio del evento</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora de Fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} placeholder="13:00" />
                    </FormControl>
                    <FormDescription>Hora de finalización (HH:MM)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación</FormLabel>
                    <FormControl>
                      <Input placeholder="Ubicación del evento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Campos opcionales comentados 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Capacidad <span className="text-muted-foreground">(Opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Ej: 100 (dejar vacío = sin límite)"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Número máximo de participantes (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Precio <span className="text-muted-foreground">(Opcional)</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Ej: 25.50 (dejar vacío = gratis)"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Precio en USD (opcional - vacío = evento gratuito)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>*/}

            {/* Campo de WhatsApp */}
            <div className="space-y-4">
              <FormLabel className="text-base font-medium">Contacto WhatsApp</FormLabel>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar país" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center gap-2 ">
                                <span>{country.name}</span>
                                <span className="text-muted-foreground">{country.dialCode}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Número de WhatsApp</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted text-muted-foreground">
                            <Phone className="h-4 w-4 mr-1" />
                            {selectedCountry.dialCode}
                          </div>
                          <Input placeholder="" className="rounded-l-none" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Número completo: {selectedCountry.dialCode}
                        {field.value}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imágenes y Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de la imagen principal</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/imagen.jpg" {...field} />
                  </FormControl>
                  <FormDescription>URL de la imagen principal del evento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del logo principal</FormLabel>
                  <FormControl>
                    <Input placeholder="https://ejemplo.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>URL del logo principal del evento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="logo1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del logo adicional 1</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/logo1.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del logo adicional 2</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/logo2.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="logo3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL del logo adicional 3</FormLabel>
                    <FormControl>
                      <Input placeholder="https://ejemplo.com/logo3.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="trailerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL del trailer</FormLabel>
                  <FormControl>
                    <Input placeholder="https://youtube.com/embed/..." {...field} />
                  </FormControl>
                  <FormDescription>URL del video de presentación del evento</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Temas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="topics"
              render={() => (
                <FormItem>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {form.watch("topics")?.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                      >
                        {topic}
                        <button
                          type="button"
                          onClick={() => removeTopic(topic)}
                          className="text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Añadir tema"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button type="button" onClick={addTopic}>
                      <Plus className="h-4 w-4 mr-1" /> Añadir
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="fixed bottom-8 right-8 z-50">
          <Button
            type="button"
            onClick={handleSaveClick}
            disabled={loading}
            size="lg"
            className="bg-green-600 hover:bg-green-700 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar Evento"
            ) : (
              "Crear Evento"
            )}
          </Button>
        </div>

        <div className="flex justify-end gap-4 pb-20">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSaveClick}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar Evento"
            ) : (
              "Crear Evento"
            )}
          </Button>
        </div>
      </div>
    </Form>
  )
}
