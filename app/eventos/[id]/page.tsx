"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Calendar, MapPin, Clock, Users, Check, Volume2, VolumeX } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"

// Interfaces que coinciden con la estructura de tu backend
interface Event {
  id: string
  title: string
  description: string
  dateTime: string // ISO string from backend
  location: string
  image: string
  logo: string
  capacity: number
  price: string // Cambiar de number a string
  topics: string[] // Array de temas del evento
  logo1?: string
  logo2?: string
  logo3?: string
  trailerUrl?: string
}

interface CountryInfo {
  country: string
  countryCode: string
  currency: string
  currencySymbol: string
  exchangeRate: number
}

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthContext()

  // Unwrap params usando React.use()
  const resolvedParams = React.use(params)
  const eventId = resolvedParams.id
  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [isTrailerVideo, setIsTrailerVideo] = useState(false)
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null)
  const [hasRegistered, setHasRegistered] = useState(false)
  const [availableSpots, setAvailableSpots] = useState(0)

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Function to convert price to local currency
  const convertToLocalCurrency = (priceUSD: string) => {
    const price = Number.parseFloat(priceUSD)

    if (!countryInfo) return null

    // For Bolivia, we use a fixed exchange rate of 6.96
    const exchangeRate = countryInfo.countryCode === "BO" ? 6.96 : countryInfo.exchangeRate

    return {
      price: price * exchangeRate,
      currency: countryInfo.currency,
      symbol: countryInfo.currencySymbol,
      country: countryInfo.country,
      exchangeRate: exchangeRate,
    }
  }

  // Format date from ISO string to a readable format
  const formatEventDate = (dateTimeStr: string) => {
    const dateTime = new Date(dateTimeStr)

    // Format date: "LUNES 29 DE MARZO, 2025"
    const days = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"]
    const months = [
      "ENERO",
      "FEBRERO",
      "MARZO",
      "ABRIL",
      "MAYO",
      "JUNIO",
      "JULIO",
      "AGOSTO",
      "SEPTIEMBRE",
      "OCTUBRE",
      "NOVIEMBRE",
      "DICIEMBRE",
    ]

    const day = days[dateTime.getDay()]
    const date = dateTime.getDate()
    const month = months[dateTime.getMonth()]
    const year = dateTime.getFullYear()

    const formattedDate = `${day} ${date} DE ${month}, ${year}`

    // Format time: "12:00 PM - 03:00 PM"
    const hours = dateTime.getHours()
    const minutes = dateTime.getMinutes().toString().padStart(2, "0")
    const ampm = hours >= 12 ? "PM" : "AM"
    const hour12 = hours % 12 || 12

    const endHour = (hours + 3) % 24
    const endAmpm = endHour >= 12 ? "PM" : "AM"
    const endHour12 = endHour % 12 || 12

    const formattedTime = `${hour12}:${minutes} ${ampm} - ${endHour12}:${minutes} ${endAmpm}`

    return { date: formattedDate, time: formattedTime }
  }

  useEffect(() => {
    const detectCountry = async () => {
      try {
        // First, we try to detect from the browser
        const browserLocale = navigator.language || navigator.languages?.[0]
        if (browserLocale?.includes("es-BO") || browserLocale?.includes("es_BO")) {
          setCountryInfo({
            country: "Bolivia",
            countryCode: "BO",
            currency: "BOB",
            currencySymbol: "Bs",
            exchangeRate: 6.96,
          })
          return
        }

        // Try to detect from timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (timezone === "America/La_Paz") {
          setCountryInfo({
            country: "Bolivia",
            countryCode: "BO",
            currency: "BOB",
            currencySymbol: "Bs",
            exchangeRate: 6.96,
          })
          return
        }

        // Fallback to Bolivia
        setCountryInfo({
          country: "Bolivia",
          countryCode: "BO",
          currency: "BOB",
          currencySymbol: "Bs",
          exchangeRate: 6.96,
        })
      } catch (error) {
        console.error("Error detecting country:", error)
        // Fallback to Bolivia
        setCountryInfo({
          country: "Bolivia",
          countryCode: "BO",
          currency: "BOB",
          currencySymbol: "Bs",
          exchangeRate: 6.96,
        })
      }
    }

    detectCountry()
  }, [])

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true)
        // Get specific event by ID
        const eventData = await api.get<Event>(`/event/${eventId}`)
        setEvent(eventData)

        // Calculate available spots
        // Aquí deberías obtener las reservas actuales del evento
        // Por ahora simulamos que hay algunas reservas
        const currentReservations = 0 // Esto debería venir de tu API
        setAvailableSpots(eventData.capacity - currentReservations)

        // Determine if the trailer is a video or an image
        if (eventData.trailerUrl) {
          setIsTrailerVideo(
            eventData.trailerUrl.includes("youtube") ||
              eventData.trailerUrl.includes("vimeo") ||
              eventData.trailerUrl.includes("youtu.be") ||
              eventData.trailerUrl.includes("mp4") ||
              eventData.trailerUrl.endsWith(".mp4") ||
              eventData.trailerUrl.endsWith(".mov") ||
              eventData.trailerUrl.endsWith(".avi"),
          )
        }

        // Get all events for related events section
        const allEvents = await api.get<Event[]>("/event")
        // Filter out the current event and limit to 3 events
        const filtered = allEvents.filter((e) => e.id !== eventId).slice(0, 3)
        setRelatedEvents(filtered)

        // Verify if the user has registered for the event
        if (isAuthenticated && user) {
          try {
            // Here you should make a call to your API to verify if the user has registered for the event
            // For example: const userRegistrations = await api.get('/user/events')
            // setHasRegistered(userRegistrations.some(r => r.eventId === params.id))

            // For now, we simulate that the user has not registered
            setHasRegistered(false)
          } catch (error) {
            console.error("Error verifying user registrations:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching event data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchEventData()
  }, [eventId, isAuthenticated, user])

  const handleBuy = async () => {
    if (!event) return

    // Check if there are available spots
    if (availableSpots <= 0) {
      toast({
        title: "Evento lleno",
        description: "Ya no hay cupos disponibles para este evento.",
        variant: "destructive",
      })
      return
    }

    setPurchasing(true)

    try {
      // Función para convertir precio a número si es string
      const parsePrice = (price: string | number): number => {
        if (typeof price === "string") {
          return Number.parseFloat(price)
        }
        return price
      }

      const finalPrice = parsePrice(event.price)

      if (!isAuthenticated) {
        // Si no está autenticado, guardar el evento actual y redirigir a login
        localStorage.setItem("pendingPurchaseEventId", eventId)
        const redirectUrl = `/checkout?eventId=${eventId}`
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
        return
      }

      // Limpiar localStorage de datos anteriores
      localStorage.removeItem("checkoutCourse")
      localStorage.removeItem("checkoutProduct")
      localStorage.removeItem("checkoutEvent")

      // Preparar datos del evento para el checkout
      const eventData = {
        id: event.id,
        name: event.title, // Asegurarse de usar name para consistencia
        title: event.title,
        price: finalPrice,
        image: event.image,
        type: "event",
        deliveryType: "digital", // Los eventos son siempre digitales
        dateTime: event.dateTime,
        location: event.location,
        capacity: event.capacity,
        availableSpots: availableSpots,
        // Añadir estos campos para asegurar que estén disponibles para el backend
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "", // Se llenará en el checkout
        country: "Bolivia", // Por defecto
      }

      // Guardar en localStorage para que el componente de checkout pueda acceder
      localStorage.setItem("checkoutEvent", JSON.stringify(eventData))

      // Redirigir al checkout como en los cursos
      router.push("/checkout")
    } catch (error) {
      console.error("Error preparing checkout:", error)
      toast({
        title: "Error",
        description: "Ocurrió un problema al preparar la reserva.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  // Function to convert video URLs to embed format with maximum restrictions
  const getEmbedUrl = (url: string) => {
    // Vimeo URL conversion with maximum restrictions
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}?background=1&autopause=0&transparent=0&autoplay=0&controls=0&title=0&byline=0&portrait=0&pip=0&dnt=1`
    }

    // YouTube URL conversion with maximum restrictions
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&showinfo=0&iv_load_policy=3&color=white`
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&showinfo=0&iv_load_policy=3&color=white`
    }

    // For direct video files or already embed URLs
    return url
  }

  // Video control functions
  const togglePlay = () => {
    if (!iframeRef.current) return

    try {
      if (isPlaying) {
        // Pause video
        if (event?.trailerUrl?.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', "*")
        } else if (event?.trailerUrl?.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
        }
      } else {
        // Play video
        if (event?.trailerUrl?.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
        } else if (event?.trailerUrl?.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
        }
      }
      setIsPlaying(!isPlaying)
    } catch (error) {
      console.error("Error controlling video:", error)
    }
  }

  const toggleMute = () => {
    if (!iframeRef.current) return

    try {
      if (isMuted) {
        // Unmute video
        if (event?.trailerUrl?.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"setVolume","value":"1"}', "*")
        } else if (event?.trailerUrl?.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', "*")
        }
      } else {
        // Mute video
        if (event?.trailerUrl?.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"setVolume","value":"0"}', "*")
        } else if (event?.trailerUrl?.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', "*")
        }
      }
      setIsMuted(!isMuted)
    } catch (error) {
      console.error("Error controlling video volume:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl">Evento no encontrado</p>
      </div>
    )
  }

  // Convert to local currency
  const localPrice = convertToLocalCurrency(event.price)

  // Format date and time
  const { date, time } = formatEventDate(event.dateTime)

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/eventos" className="text-orange-500 hover:text-orange-600 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a eventos
          </Link>
        </div>

        {/* Video/Image Trailer */}
        <div className="relative w-full h-[400px] mb-12 rounded-lg overflow-hidden">
          {event.trailerUrl ? (
            isTrailerVideo ? (
              <div className="relative w-full h-full">
                {/* Hidden iframe with all controls disabled */}
                <iframe
                  ref={iframeRef}
                  src={getEmbedUrl(event.trailerUrl)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay"
                  style={{ pointerEvents: "none" }}
                  title="Video trailer"
                ></iframe>

                {/* Custom overlay with minimal controls */}
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                  {/* Custom play button */}
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    {!isPlaying && (
                      <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom mute button - bottom right */}
                  <div className="absolute bottom-4 right-4 cursor-pointer" onClick={toggleMute}>
                    <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={event.trailerUrl || "/placeholder.svg"}
                  alt={`Trailer de ${event.title}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={event.image || "/placeholder.svg?height=400&width=800&query=event"}
                alt={event.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Info - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="text-orange-500 font-medium mb-2">EVENTO</div>
              <h1 className="text-4xl font-black mb-6">{event.title}</h1>

              <p className="text-lg mb-8">{event.description}</p>

              {/* ¿Qué aprenderás en este evento? */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">¿Qué es lo que aprenderás en este evento?</h2>
                <div className="space-y-3">
                  {event.topics.map((topic, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <p className="font-medium">{topic}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Logos Section */}
              <div className="mb-8">
                {/* Logo principal (más grande) */}
                {event.logo && (
                  <div className="flex justify-center mb-8">
                    <div className="relative w-[300px] h-[120px]">
                      <Image
                        src={event.logo || "/placeholder.svg"}
                        alt={`${event.title} logo principal`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Logos adicionales (más pequeños) */}
                <div className="flex justify-center items-center gap-8">
                  {event.logo1 && (
                    <div className="relative w-[150px] h-[60px]">
                      <Image src={event.logo1 || "/placeholder.svg"} alt="Logo 1" fill className="object-contain" />
                    </div>
                  )}
                  {event.logo2 && (
                    <div className="relative w-[150px] h-[60px]">
                      <Image src={event.logo2 || "/placeholder.svg"} alt="Logo 2" fill className="object-contain" />
                    </div>
                  )}
                  {event.logo3 && (
                    <div className="relative w-[150px] h-[60px]">
                      <Image src={event.logo3 || "/placeholder.svg"} alt="Logo 3" fill className="object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Event Details Card - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {hasRegistered ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-md text-green-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Ya estás registrado en este evento</span>
                  </div>
                  <Button className="w-full bg-green-500 hover:bg-green-600">Ver mi registro</Button>
                </div>
              ) : (
                <>
                  {/* Event Details */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-6 w-6 text-orange-500 mr-3" />
                      <div>
                        <h3 className="text-orange-500 font-medium">Fecha</h3>
                        <p className="font-bold text-sm">{date}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-orange-500 mr-3" />
                      <div>
                        <h3 className="text-orange-500 font-medium">Hora</h3>
                        <p className="font-bold">{time}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-6 w-6 text-orange-500 mr-3" />
                      <div>
                        <h3 className="text-orange-500 font-medium">Ubicación</h3>
                        <p className="font-bold text-sm">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="h-6 w-6 text-orange-500 mr-3" />
                      <div>
                        <h3 className="text-orange-500 font-medium">Cupos disponibles</h3>
                        <p className="font-bold">Quedan {event.capacity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {/* Price in local currency - FIRST */}
                    {localPrice && (
                      <div className="flex items-center mb-2">
                        <span className="text-3xl font-bold">
                          {localPrice.symbol}
                          {localPrice.price.toFixed(2)}
                        </span>
                        <span className="ml-2 text-gray-500">{localPrice.currency}</span>
                      </div>
                    )}

                    {/* Price in USD - SECOND */}
                    <div className="text-gray-600 text-sm mt-1">
                      <span>${Number.parseFloat(event.price).toFixed(2)} USD</span>
                    </div>
                  </div>

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-6 py-6"
                    onClick={handleBuy}
                    disabled={availableSpots <= 0 || purchasing}
                  >
                    {purchasing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        {availableSpots <= 0 ? "Evento lleno" : "Reservar cupo"}
                      </>
                    )}
                  </Button>

                  {/* Capacity warning */}
                  {availableSpots <= 5 && availableSpots > 0 && (
                    <div className="text-center text-sm text-orange-600">
                      ⚠️ Solo quedan {availableSpots} cupos disponibles
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Otros eventos que te pueden interesar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedEvents.map((relatedEvent) => {
                // Convert to local currency
                const relatedLocalPrice = convertToLocalCurrency(relatedEvent.price)
                const { date: relatedDate } = formatEventDate(relatedEvent.dateTime)

                return (
                  <div key={relatedEvent.id} className="bg-white rounded-lg overflow-hidden shadow">
                    <div className="relative h-48 w-full">
                      <Image
                        src={relatedEvent.image || "/placeholder.svg?height=200&width=300"}
                        alt={relatedEvent.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="text-orange-500 text-sm font-medium mb-1">Evento</div>
                      <h3 className="font-bold mb-2">{relatedEvent.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{relatedDate}</p>
                      <p className="text-gray-600 text-sm mb-4">{relatedEvent.description}</p>

                      {/* Price */}
                      <div className="mb-4">
                        {relatedLocalPrice && (
                          <div className="flex items-center">
                            <span className="text-2xl font-bold">
                              {relatedLocalPrice.symbol}
                              {relatedLocalPrice.price.toFixed(2)}
                            </span>
                            <span className="ml-1 text-sm text-gray-500">{relatedLocalPrice.currency}</span>
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-1">
                          ${Number.parseFloat(relatedEvent.price).toFixed(2)} USD
                        </div>
                      </div>

                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => router.push(`/eventos/${relatedEvent.id}`)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Reservar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
