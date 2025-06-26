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
function formatEventDate(dateTimeStr: string, endTimeStr: string): {
  day: string
  month: string
  year: string
  fullDate: string
  time: string
  endTimeFormatted: string
} {
  const dateTime = new Date(dateTimeStr)
  const [hours, minutes] = endTimeStr.split(':').slice(0, 2)

  const day = dateTime.getDate().toString()
  const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]
  const month = months[dateTime.getMonth()]
  const year = dateTime.getFullYear().toString()

  // Format for display: "Sábado, 10 de mayo 2024"
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
  const monthsLong = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ]
  const fullDate = `${days[dateTime.getDay()]}, ${dateTime.getDate()} de ${monthsLong[dateTime.getMonth()]} ${dateTime.getFullYear()}`

  // Format start time
  const startHours = dateTime.getHours()
  const startMinutes = dateTime.getMinutes().toString().padStart(2, "0")
  const startAmPm = startHours < 12 ? "am" : "pm"
  const startTime12 = startHours % 12 || 12

  // Format end time
  const endHours = parseInt(hours)
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

        {/* Featured Event with Countdown */}
        {featuredEvent && (
          <div className="bg-black text-white rounded-3xl overflow-hidden mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left side - Image */}
              <div className="relative h-[300px] md:h-auto">
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  {featuredEvent.trailerUrl && (
                    <button 
                      onClick={() => window.open(featuredEvent.trailerUrl, '_blank')}
                      className="bg-white/20 rounded-full p-4 backdrop-blur-sm hover:bg-white/30 transition-colors"
                    >
                      <Play className="h-8 w-8 text-white fill-white" />
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

              {/* Right side - Content */}
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-4">{featuredEvent.title}</h2>
                <p className="text-gray-300 mb-6">{featuredEvent.description}</p>

                <div className="text-orange-500 font-medium mb-3">Evento más próximo</div>

                <div className="flex items-center mb-2">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>{formatEventDate(featuredEvent.dateTime, featuredEvent.endTime).fullDate}</span>
                </div>

                <div className="flex items-center mb-2">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{formatEventDate(featuredEvent.dateTime, featuredEvent.endTime).time}</span>
                </div>

                <div className="flex items-center mb-4">
                  <span className="text-sm text-gray-300">
                    📍 {featuredEvent.location} • 👥 {featuredEvent.capacity} personas • 💰 ${featuredEvent.price}
                  </span>
                </div>

                {/* Topics */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {featuredEvent.topics.map((topic, index) => (
                      <span key={index} className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Días</div>
                    <div className="text-4xl font-bold bg-gray-800 rounded-lg p-2">{countdown.days}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Horas</div>
                    <div className="text-4xl font-bold bg-gray-800 rounded-lg p-2">{countdown.hours}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Minutos</div>
                    <div className="text-4xl font-bold bg-gray-800 rounded-lg p-2">{countdown.minutes}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-1">Segundos</div>
                    <div className="text-4xl font-bold bg-gray-800 rounded-lg p-2">{countdown.seconds}</div>
                  </div>
                </div>

                <Link
                  href={`/eventos/${featuredEvent.id}`}
                  className="inline-flex items-center bg-orange-500 text-black px-6 py-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  Ver más
                  <ChevronRight className="h-5 w-5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Event List */}
        <div className="space-y-12">
          {events.map((event) => {
            const { day, month, year, time } = formatEventDate(event.dateTime, event.endTime)

            return (
              <div key={event.id} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left - Image and Date */}
                <div className="md:col-span-4 flex">
                  <div className="relative w-[180px] h-[180px] rounded-xl overflow-hidden">
                    <Image
                      src={event.image || "/placeholder.svg?height=180&width=180&query=event"}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="ml-4 flex flex-col justify-center">
                    <div className="text-6xl font-black">{day}</div>
                    <div className="text-2xl font-bold">{month}</div>
                    <div className="h-1 w-12 bg-orange-500 my-1"></div>
                    <div className="text-xl">{year}</div>
                  </div>
                </div>

                {/* Right - Event Details */}
                <div className="md:col-span-8 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{event.title}</h3>

                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-gray-700">{time}</span>
                    </div>

                    <div className="flex items-center mb-3">
                      <span className="text-sm text-gray-600">
                        📍 {event.location} • 👥 {event.capacity} personas • 💰 ${event.price}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{event.description}</p>

                    {/* Topics */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.topics.map((topic, index) => (
                        <span key={index} className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>

                    <Link
                      href={`/eventos/${event.id}`}
                      className="inline-flex items-center bg-orange-500 text-black px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
                    >
                      Ver más
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>

                  {/* Logo */}
                  <div className="hidden md:block w-[120px] h-[60px] relative">
                    {event.logo && (
                      <Image 
                        src={event.logo} 
                        alt="Event logo" 
                        fill
                        className="object-contain"
                      />
                    )}
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