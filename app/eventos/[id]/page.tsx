"use client"

import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, Calendar, MapPin, Clock, Users, Volume2, VolumeX, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { useCurrency } from "@/hooks/use-currency"

interface Event {
  id: string
  title: string
  description: string
  dateTime: string
  endTime: string // Hora de fin en formato HH:MM:SS
  location: string
  image: string
  logo: string
  capacity: number
  price: string
  topics: string[]
  logo1?: string
  logo2?: string
  logo3?: string
  trailerUrl?: string
}

interface EventPageProps {
  params: Promise<{
    id: string
  }>
}

export default function EventPage({ params }: EventPageProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthContext()
  const { formatPrice, currency, isLoading: currencyLoading } = useCurrency()
  const resolvedParams = React.use(params)
  const eventId = resolvedParams.id

  const [event, setEvent] = useState<Event | null>(null)
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [isTrailerVideo, setIsTrailerVideo] = useState(false)
  const [hasRegistered, setHasRegistered] = useState(false)
  const [availableSpots, setAvailableSpots] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const formatEventDate = (dateTimeStr: string, endTimeStr: string) => {
    const dateTime = new Date(dateTimeStr)
    const [endHours, endMinutes] = endTimeStr.split(":").slice(0, 2)

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

    const startHours = dateTime.getHours()
    const startMinutes = dateTime.getMinutes().toString().padStart(2, "0")
    const startAmPm = startHours >= 12 ? "PM" : "AM"
    const startHour12 = startHours % 12 || 12

    const endHoursNum = Number.parseInt(endHours)
    const endMinutesStr = endMinutes.padStart(2, "0")
    const endAmPm = endHoursNum >= 12 ? "PM" : "AM"
    const endHour12 = endHoursNum % 12 || 12

    const formattedTime = `${startHour12}:${startMinutes} ${startAmPm} - ${endHour12}:${endMinutesStr} ${endAmPm}`

    return {
      date: formattedDate,
      time: formattedTime,
      dayNumber: date,
      monthName: month,
      year: year,
      startTime: `${startHour12}:${startMinutes} ${startAmPm}`,
      endTime: `${endHour12}:${endMinutesStr} ${endAmPm}`,
    }
  }

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true)

        const eventData = await api.get<Event>(`/event/${eventId}`)
        setEvent(eventData)
        setAvailableSpots(eventData.capacity - 0)

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

        const allEvents = await api.get<Event[]>("/event")
        const filtered = allEvents.filter((e) => e.id !== eventId).slice(0, 3)
        setRelatedEvents(filtered)

        if (isAuthenticated && user) {
          setHasRegistered(false)
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
      const parsePrice = (price: string | number): number => {
        if (typeof price === "string") return Number.parseFloat(price)
        return price
      }

      const finalPrice = parsePrice(event.price)

      if (!isAuthenticated) {
        localStorage.setItem("pendingPurchaseEventId", eventId)
        const redirectUrl = `/checkout?eventId=${eventId}`
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
        return
      }

      localStorage.removeItem("checkoutCourse")
      localStorage.removeItem("checkoutProduct")
      localStorage.removeItem("checkoutEvent")

      const eventData = {
        id: event.id,
        name: event.title,
        title: event.title,
        price: finalPrice,
        image: event.image,
        type: "event",
        deliveryType: "digital",
        dateTime: event.dateTime,
        location: event.location,
        capacity: event.capacity,
        availableSpots: availableSpots,
        fullName: user?.name || "",
        email: user?.email || "",
        phone: "",
        country: "Bolivia",
      }

      localStorage.setItem("checkoutEvent", JSON.stringify(eventData))
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

  const getEmbedUrl = (url: string) => {
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}?background=1&autopause=0&transparent=0&autoplay=0&controls=0&title=0&byline=0&portrait=0&pip=0&dnt=1`
    }

    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&showinfo=0&iv_load_policy=3&color=white`
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&showinfo=0&iv_load_policy=3&color=white`
    }

    return url
  }

  const togglePlay = () => {
    if (!iframeRef.current) return

    try {
      if (isPlaying) {
        if (event?.trailerUrl?.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', "*")
        } else if (event?.trailerUrl?.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
        }
      } else {
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
        if (event?.trailerUrl?.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"setVolume","value":"1"}', "*")
        } else if (event?.trailerUrl?.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', "*")
        }
      } else {
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

  const { date, time, dayNumber, monthName, year, startTime, endTime } = formatEventDate(event.dateTime, event.endTime)

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-4 px-4 md:py-8">
        <div className="mb-4 md:mb-8">
          <Link
            href="/eventos"
            className="text-orange-700 hover:text-orange-600 flex items-center text-sm md:text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a eventos
          </Link>
        </div>

        {/* Mobile layout - Title first */}
        <div className="lg:hidden">
          <h1 className="text-2xl md:text-4xl font-black mb-4">{event.title}</h1>
        </div>

        <div className="relative w-full mb-6 rounded-2xl overflow-hidden lg:rounded-3xl">
          <div className="aspect-video bg-black">
            {event.trailerUrl ? (
              isTrailerVideo ? (
                <div className="relative w-full h-full">
                  <iframe
                    ref={iframeRef}
                    src={getEmbedUrl(event.trailerUrl)}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="autoplay"
                    style={{ pointerEvents: "none" }}
                    title="Video trailer"
                  ></iframe>

                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                      onClick={togglePlay}
                    >
                      {!isPlaying && (
                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full flex items-center justify-center group-hover:from-orange-600 group-hover:to-orange-700 transition-all duration-300 shadow-2xl border-4 border-white/20">
                          <div className="w-0 h-0 border-t-[8px] md:border-t-[12px] border-t-transparent border-l-[14px] md:border-l-[20px] border-l-white border-b-[8px] md:border-b-[12px] border-b-transparent ml-1"></div>
                        </div>
                      )}
                    </div>

                    <div
                      className="absolute bottom-2 md:bottom-4 right-2 md:right-4 cursor-pointer group"
                      onClick={toggleMute}
                    >
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-all duration-300 border border-white/20">
                        {isMuted ? (
                          <VolumeX size={16} className="md:w-5 md:h-5" />
                        ) : (
                          <Volume2 size={16} className="md:w-5 md:h-5" />
                        )}
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
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-2xl border-4 border-white/30 cursor-pointer group">
                      <div className="w-0 h-0 border-t-[8px] md:border-t-[12px] border-t-transparent border-l-[14px] md:border-l-[20px] border-l-white border-b-[8px] md:border-b-[12px] border-b-transparent ml-1 group-hover:scale-110 transition-transform"></div>
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-2xl border-4 border-white/30 cursor-pointer group">
                    <div className="w-0 h-0 border-t-[8px] md:border-t-[12px] border-t-transparent border-l-[14px] md:border-l-[20px] border-l-white border-b-[8px] md:border-b-[12px] border-b-transparent ml-1 group-hover:scale-110 transition-transform"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile layout estilo tarjeta - SOLO MÓVIL */}
        <div className="lg:hidden rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between w-full mb-3">
            {/* Fecha - Estilo como en la imagen */}
            <div className="flex items-center">
              <div className="text-right mr-2">
                <div className="text-3xl font-black leading-none">{dayNumber}</div>
                <div className="text-xs font-black uppercase">{monthName}</div>
                <div className="text-xs font-black">{year}</div>
              </div>

              {/* Separador */}
              <div className="h-12 w-px bg-orange-700 mx-3"></div>

              {/* Horario */}
              <div className="flex flex-col">
                <div className="text-sm font-light">{startTime}</div>
                <div className="text-sm font-light mt-1">{endTime}</div>
              </div>
            </div>

            <div className="h-12 w-px bg-orange-700 mx-3"></div>

            <Button
              className="bg-orange-700 hover:bg-orange-600 text-black rounded-full text-xs px-4 py-2 font-semibold flex items-center gap-2"
              onClick={handleBuy}
              disabled={availableSpots <= 0 || purchasing}
            >
              {purchasing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ...
                </>
              ) : (
                <>
                  Comprar
                  <ShoppingCart className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Ubicación */}
          <div className="flex items-center text-xs text-black font-normal">
            Dirección :<span className="font-light">{event.location}</span>
          </div>

          {/* Precio en mobile */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">
                  {currencyLoading ? (
                    <span className="animate-pulse bg-gray-200 rounded px-3 py-1">Cargando...</span>
                  ) : (
                    formatPrice(Number.parseFloat(event.price))
                  )}
                </div>
                {!currencyLoading && currency.code !== "USD" && (
                  <div className="text-xs text-gray-500">
                    Precio original: ${Number.parseFloat(event.price).toFixed(2)} USD
                  </div>
                )}
                {currency.code === "BOB" && (
                  <div className="text-xs text-gray-500">Cambio oficial del BCB aplicado</div>
                )}
              </div>
              {!currencyLoading && currency.code !== "USD" && (
                <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded">{currency.code}</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2">
            {/* Desktop title - hidden on mobile */}
            <div className="hidden lg:block mb-6 md:mb-8">
              <div className="text-orange-700 font-medium mb-2 text-sm md:text-base">EVENTO</div>
              <h1 className="text-2xl md:text-4xl font-black mb-4 md:mb-6">{event.title}</h1>
            </div>

            <div className="mb-6 md:mb-8">
              <p className="text-base md:text-lg font-light">{event.description}</p>
            </div>

            <div className="mb-6 md:mb-8">
              <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">¿Qué es lo que aprenderás en este taller?</h2>
              <div className="space-y-2 md:space-y-3">
                {event.topics.map((topic, index) => (
                  <div key={index} className="flex items-start gap-2 md:gap-3">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white flex items-center justify-center mt-0.5">
                      <CheckCircle className="w-4 h-4 md:w-5 md:h-5 font-normal text-green-500" />
                    </div>
                    <p className="font-normal text-sm md:text-base">{topic}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              {event.logo && (
                <div className="flex justify-center mb-6 md:mb-8">
                  <div className="relative w-[200px] h-[80px] md:w-[300px] md:h-[120px]">
                    <Image
                      src={event.logo || "/placeholder.svg"}
                      alt={`${event.title} logo principal`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-center items-center gap-4 md:gap-8 flex-wrap">
                {event.logo1 && (
                  <div className="relative w-[100px] h-[40px] md:w-[150px] md:h-[60px]">
                    <Image src={event.logo1 || "/placeholder.svg"} alt="Logo 1" fill className="object-contain" />
                  </div>
                )}
                {event.logo2 && (
                  <div className="relative w-[100px] h-[40px] md:w-[150px] md:h-[60px]">
                    <Image src={event.logo2 || "/placeholder.svg"} alt="Logo 2" fill className="object-contain" />
                  </div>
                )}
                {event.logo3 && (
                  <div className="relative w-[100px] h-[40px] md:w-[150px] md:h-[60px]">
                    <Image src={event.logo3 || "/placeholder.svg"} alt="Logo 3" fill className="object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop sidebar - hidden on mobile */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 sticky top-4 md:top-24">
              {hasRegistered ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-3 md:p-4 rounded-md text-green-800 flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm md:text-base">Ya estás registrado en este evento</span>
                  </div>
                  <Button className="w-full bg-green-500 hover:bg-green-600 py-3 md:py-4 text-sm md:text-base">
                    Ver mi registro
                  </Button>
                </div>
              ) : (
                <>
                  <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 md:h-6 md:w-6 text-orange-700 mr-2 md:mr-3" />
                      <div>
                        <h3 className="text-orange-700 font-medium text-sm md:text-base">Fecha</h3>
                        <p className="font-bold text-xs md:text-sm">{date}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Clock className="h-5 w-5 md:h-6 md:w-6 text-orange-700 mr-2 md:mr-3" />
                      <div>
                        <h3 className="text-orange-700 font-medium text-sm md:text-base">Hora</h3>
                        <p className="font-bold text-xs md:text-sm">{time}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 md:h-6 md:w-6 text-orange-700 mr-2 md:mr-3" />
                      <div>
                        <h3 className="text-orange-700 font-medium text-sm md:text-base">Ubicación</h3>
                        <p className="font-bold text-xs md:text-sm">{event.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Users className="h-5 w-5 md:h-6 md:w-6 text-orange-700 mr-2 md:mr-3" />
                      <div>
                        <h3 className="text-orange-700 font-medium text-sm md:text-base">Cupos disponibles</h3>
                        <p className="font-bold text-xs md:text-sm">Quedan {event.capacity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl md:text-3xl font-bold">
                        {currencyLoading ? (
                          <span className="animate-pulse bg-gray-200 rounded px-4 py-1">Cargando...</span>
                        ) : (
                          formatPrice(Number.parseFloat(event.price))
                        )}
                      </span>
                    </div>

                    {/* Mostrar precio en USD como referencia si no es USD */}
                    {!currencyLoading && currency.code !== "USD" && (
                      <div className="text-gray-600 text-xs md:text-sm mt-1">
                        <span>Precio original: ${Number.parseFloat(event.price).toFixed(2)} USD</span>
                      </div>
                    )}

                    {/* Información específica para Bolivia */}
                    {currency.code === "BOB" && (
                      <div className="text-gray-500 text-xs md:text-sm mt-1">Cambio oficial del BCB aplicado</div>
                    )}

                    {/* Indicador de moneda */}
                    {!currencyLoading && currency.code !== "USD" && (
                      <div className="text-xs text-gray-500 mt-2">
                        Precios mostrados en {currency.code} • Tasa de cambio actualizada
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-orange-700 hover:bg-orange-600 text-black mb-4 md:mb-6 py-4 md:py-6 rounded-full text-sm md:text-base font-semibold"
                    onClick={handleBuy}
                    disabled={availableSpots <= 0 || purchasing}
                  >
                    {purchasing ? (
                      <>
                        <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                        {availableSpots <= 0 ? "Evento lleno" : "Reservar cupo"}
                      </>
                    )}
                  </Button>

                  {availableSpots <= 5 && availableSpots > 0 && (
                    <div className="text-center text-xs md:text-sm text-orange-700">
                      ⚠️ Solo quedan {availableSpots} cupos disponibles
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {relatedEvents.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8">Otros eventos que te pueden interesar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {relatedEvents.map((relatedEvent) => {
                const { date: relatedDate } = formatEventDate(relatedEvent.dateTime, relatedEvent.endTime)

                return (
                  <div key={relatedEvent.id} className="bg-white rounded-lg overflow-hidden shadow">
                    <div className="relative h-40 md:h-48 w-full">
                      <Image
                        src={relatedEvent.image || "/placeholder.svg?height=200&width=300"}
                        alt={relatedEvent.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-3 md:p-4">
                      <div className="text-orange-500 text-xs md:text-sm font-medium mb-1">Evento</div>
                      <h3 className="font-bold mb-2 text-sm md:text-base">{relatedEvent.title}</h3>
                      <p className="text-gray-600 text-xs md:text-sm mb-2">{relatedDate}</p>
                      <p className="text-gray-600 text-xs md:text-sm mb-4 line-clamp-2">{relatedEvent.description}</p>

                      <div className="mb-4">
                        <div className="flex items-center">
                          <span className="text-lg md:text-2xl font-bold">
                            {currencyLoading ? (
                              <span className="animate-pulse bg-gray-200 rounded px-2 py-1">...</span>
                            ) : (
                              formatPrice(Number.parseFloat(relatedEvent.price))
                            )}
                          </span>
                        </div>

                        {!currencyLoading && currency.code !== "USD" && (
                          <div className="text-gray-500 text-xs mt-1">
                            ${Number.parseFloat(relatedEvent.price).toFixed(2)} USD
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-orange-700 hover:bg-orange-600 text-black rounded-full py-2 md:py-3 text-sm md:text-base"
                        onClick={() => router.push(`/eventos/${relatedEvent.id}`)}
                      >
                        <ShoppingCart className="mr-2 h-3 w-3 md:h-4 md:w-4" />
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
