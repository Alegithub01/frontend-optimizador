"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Play, Calendar, Clock, ChevronRight } from "lucide-react"
import { api } from "@/lib/api"

// Define the Event interface based on your backend structure
interface Event {
  id: string
  title: string
  description: string
  dateTime: string // ISO string from backend
  endTime: string // Hora de fin en formato HH:MM:SS
  location: string
  image: string
  logo: string
  logo1?: string
  logo2?: string
  logo3?: string
  capacity: number
  price: string
  topics: string[]
  trailerUrl?: string
}

// Custom hook to fetch events
function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true)
        const data = await api.get<Event[]>("/event")
        setEvents(data)
      } catch (err: any) {
        setError(err.message || "Error al cargar los eventos")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return { events, loading, error }
}

// Format date from ISO string
function formatEventDate(
  dateTimeStr: string,
  endTimeStr: string,
): {
  day: string
  month: string
  year: string
  fullDate: string
  time: string
  endTimeFormatted: string
} {
  const dateTime = new Date(dateTimeStr)
  const [hours, minutes] = endTimeStr.split(":").slice(0, 2)

  const day = dateTime.getDate().toString()
  const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
  const month = months[dateTime.getMonth()]
  const year = dateTime.getFullYear().toString()

  // Format for display: "Sábado, 10 de mayo 2024"
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const monthsLong = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ]

  const fullDate = `${days[dateTime.getDay()]}, ${dateTime.getDate()} de ${monthsLong[dateTime.getMonth()]} ${dateTime.getFullYear()}`

  // Format start time
  const startHours = dateTime.getHours()
  const startMinutes = dateTime.getMinutes().toString().padStart(2, "0")
  const startAmPm = startHours < 12 ? "am" : "pm"
  const startTime12 = startHours % 12 || 12

  // Format end time
  const endHours = Number.parseInt(hours)
  const endMinutes = minutes.padStart(2, "0")
  const endAmPm = endHours < 12 ? "am" : "pm"
  const endTime12 = endHours % 12 || 12

  const time = `${startTime12}:${startMinutes} ${startAmPm} - ${endTime12}:${endMinutes} ${endAmPm}`
  const endTimeFormatted = `${endTime12}:${endMinutes} ${endAmPm}`

  return { day, month, year, fullDate, time, endTimeFormatted }
}

// Calculate countdown to the next event
function useCountdown(targetDate: string) {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const target = new Date(targetDate).getTime()

    const interval = setInterval(() => {
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        clearInterval(interval)
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return countdown
}

export default function EventsPage() {
  const { events, loading, error } = useEvents()
  const [featuredEvent, setFeaturedEvent] = useState<Event | null>(null)
  const countdown = useCountdown(featuredEvent?.dateTime || "")

  // Set the featured event (first upcoming event)
  useEffect(() => {
    if (events && events.length > 0) {
      // Sort events by date and get the first upcoming one
      const upcomingEvents = events
        .filter((event) => new Date(event.dateTime) > new Date())
        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())

      if (upcomingEvents.length > 0) {
        setFeaturedEvent(upcomingEvents[0])
      } else {
        // If no upcoming events, just use the first one
        setFeaturedEvent(events[0])
      }
    }
  }, [events])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando eventos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-lg font-medium text-orange-500">Todos los</h2>
          <h1 className="text-5xl font-black">EVENTOS</h1>
        </div>

        {/* Featured Event - Desktop y Mobile */}
        {featuredEvent && (
          <>
            {/* Desktop Layout */}
            <div className="hidden lg:block bg-gray-1 text-white rounded-3xl overflow-hidden mb-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left side - Video/Image con contador debajo */}
                <div className="flex flex-col">
                  {/* Video/Image con bordes */}
                  <div className="p-6">
                    <div className="relative h-[300px] lg:h-[300px] rounded-2xl overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        {featuredEvent.trailerUrl && (
                          <button
                            onClick={() => window.open(featuredEvent.trailerUrl, "_blank")}
                            className="bg-white/20 rounded-full p-4 backdrop-blur-sm hover:bg-white/30 transition-colors"
                          >
                            <Play className="h-8 w-8 fill-white" />
                          </button>
                        )}
                      </div>
                      <Image
                        src={featuredEvent.image || "/placeholder.svg?height=400&width=600&query=event"}
                        alt={featuredEvent.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Countdown debajo del video */}
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-white mb-1">Días</div>
                        <div className="text-3xl font-black bg-gray-4 rounded-lg py-3 px-2">{countdown.days}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white mb-1">Horas</div>
                        <div className="text-3xl font-black bg-gray-4 rounded-lg py-3 px-2">{countdown.hours}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white mb-1">Minutos</div>
                        <div className="text-3xl font-black bg-gray-4 rounded-lg py-3 px-2">{countdown.minutes}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-white mb-1">Segundos</div>
                        <div className="text-3xl font-black bg-gray-4 rounded-lg py-3 px-2">{countdown.seconds}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side - Content */}
                <div className="p-8 flex flex-col justify-center">
                  <h2 className="text-3xl font-extrabold mb-4">{featuredEvent.title}</h2>
                  <p className="text-white mb-6 font-light">{featuredEvent.description}</p>

                  <div className="text-orange-500 font-light mb-4">Evento más próximo</div>

                  <div className="flex items-center mb-3 font-light">
                    <Calendar className="h-5 w-5 mr-3" />
                    <span>{formatEventDate(featuredEvent.dateTime, featuredEvent.endTime).fullDate}</span>
                  </div>

                  <div className="flex items-center mb-6 font-light">
                    <Clock className="h-5 w-5 mr-3" />
                    <span>{formatEventDate(featuredEvent.dateTime, featuredEvent.endTime).time}</span>
                  </div>

                  <Link
                    href={`/eventos/${featuredEvent.id}`}
                    className="inline-flex items-center bg-orange-700 text-black font-semibold px-6 py-3 rounded-full hover:bg-orange-600 transition-colors w-fit"
                  >
                    Ver más
                    <ChevronRight className="h-5 w-5 ml-2" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Mobile Layout - Como en la imagen */}
            <div className="lg:hidden bg-gray-1 text-white rounded-3xl overflow-hidden mb-16 relative">
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={featuredEvent.image || "/placeholder.svg?height=400&width=600&query=event"}
                  alt={featuredEvent.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/60"></div>
              </div>

              {/* Content */}
              <div className="relative z-10 p-6 flex flex-col justify-between min-h-[400px]">
                {/* Top Content */}
                <div>
                  <h2 className="text-3xl font-black mb-4">{featuredEvent.title}</h2>
                  <p className="text-white font-light text-sm leading-relaxed">{featuredEvent.description}</p>
                </div>

                {/* Bottom Content */}
                <div className="mt-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black">
                        {formatEventDate(featuredEvent.dateTime, featuredEvent.endTime).day}{" "}
                        {formatEventDate(featuredEvent.dateTime, featuredEvent.endTime).month}{" "}
                        {formatEventDate(featuredEvent.dateTime, featuredEvent.endTime).year}
                      </div>
                    </div>
                    <Link
                      href={`/eventos/${featuredEvent.id}`}
                      className="bg-orange-500 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
                    >
                      Agotado
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Event List - Solo Desktop */}
        <div className="hidden lg:block space-y-8">
          {events.map((event) => {
            const { day, month, year, time } = formatEventDate(event.dateTime, event.endTime)
            return (
              <div key={event.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left - Image and Date centrados */}
                <div className="md:col-span-4 flex items-center justify-center md:justify-start">
                  <div className="relative w-[160px] h-[160px] rounded-xl overflow-hidden">
                    <Image
                      src={event.image || "/placeholder.svg?height=160&width=160&query=event"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-20 flex flex-col items-center">
                    <div className="text-5xl font-black text-center">{day}</div>
                    <div className="text-2xl font-black text-center">{month}</div>
                    <div className="h-1 w-12 bg-orange-700 my-1"></div>
                    <div className="text-2xl text-center font-black">{year}</div>
                  </div>
                </div>

                {/* Right - Event Details */}
                <div className="md:col-span-8 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-2xl font-black mb-3">{event.title}</h3>
                    <div className="flex items-center mb-4">
                      <Clock className="h-5 w-5 text-black mr-2" />
                      <span className="text-black">{time}</span>
                    </div>
                    <p className="text-black font-light mb-4 line-clamp-2">{event.description}</p>

                    <Link
                      href={`/eventos/${event.id}`}
                      className="inline-flex items-center bg-orange-700 font-bold text-black px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
                    >
                      Ver más
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>

                  {/* Logo centrado */}
                  <div className="hidden md:flex items-center justify-center w-[120px] h-[80px]">
                    {event.logo && (
                      <Image
                        src={event.logo || "/placeholder.svg"}
                        alt="Event logo"
                        width={100}
                        height={60}
                        className="object-contain"
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Mobile Event List - Simple cards */}
        <div className="lg:hidden space-y-6">
          {events.slice(1).map((event) => {
            const { day, month, year } = formatEventDate(event.dateTime, event.endTime)
            return (
              <div key={event.id} className="bg-gray-1 text-white rounded-3xl overflow-hidden relative">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <Image
                    src={event.image || "/placeholder.svg?height=300&width=400&query=event"}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col justify-between min-h-[300px]">
                  <div>
                    <h3 className="text-2xl font-black mb-3">{event.title}</h3>
                    <p className="text-white font-light text-sm leading-relaxed line-clamp-3">{event.description}</p>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-black">
                          {day} {month} {year}
                        </div>
                      </div>
                      <Link
                        href={`/eventos/${event.id}`}
                        className="bg-orange-500 text-black font-bold px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
                      >
                        Ver más
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
