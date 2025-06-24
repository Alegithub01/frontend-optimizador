"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play, Calendar, Clock } from "lucide-react"
import { useEvents } from "@/hooks/useEvent"

interface Event {
  id: string
  title: string
  description: string
  image: string
  dateTime: string
}

interface FormattedEvent {
  id: string
  title: string
  description: string
  date: {
    day: number
    month: string
    year: number
  }
  image: string
}

interface FeaturedEvent extends FormattedEvent {
  eventDate: string
  eventTime: string
  eventTimestamp: number
}

export default function EventsSection() {
  const { events, loading, error } = useEvents()
  const [formattedEvents, setFormattedEvents] = useState<FormattedEvent[]>([])
  const [mainEvent, setMainEvent] = useState<FeaturedEvent | null>(null)
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    if (events && events.length > 0) {
      const formatted = events.map((event) => {
        const date = new Date(event.dateTime)
        const months = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"]

        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: {
            day: date.getDate(),
            month: months[date.getMonth()],
            year: date.getFullYear(),
          },
          image: event.image || "/placeholder.svg",
        }
      })

      setFormattedEvents(formatted)

      if (formatted.length > 0) {
        const firstEvent = formatted[0]
        const eventDate = new Date(events[0].dateTime)

        const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }
        const formattedDate = eventDate.toLocaleDateString("es-ES", options)

        const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
        const formattedTime = eventDate.toLocaleTimeString("es-ES", timeOptions)

        setMainEvent({
          ...firstEvent,
          eventDate: formattedDate,
          eventTime: formattedTime,
          eventTimestamp: eventDate.getTime(),
        })
      }
    }
  }, [events])

  useEffect(() => {
    if (!mainEvent) return

    const calculateCountdown = () => {
      const now = new Date().getTime()
      const eventTime = mainEvent.eventTimestamp
      const timeLeft = eventTime - now

      if (timeLeft <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24))
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000)

      setCountdown({ days, hours, minutes, seconds })
    }

    calculateCountdown()
    const timer = setInterval(calculateCountdown, 1000)

    return () => clearInterval(timer)
  }, [mainEvent])

  if (loading) {
    return (
      <section className="container mx-auto py-12 md:py-20 px-4">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-lg font-medium text-orange-500 mb-1">Todos los</h2>
          <h3 className="text-black text-3xl md:text-5xl font-black">EVENTOS</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Cargando eventos...</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="container mx-auto py-12 md:py-20 px-4">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-lg font-medium text-orange-500 mb-1">Todos los</h2>
          <h3 className="text-black text-3xl md:text-5xl font-black">EVENTOS</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error al cargar los eventos: {error}</p>
        </div>
      </section>
    )
  }

  if (formattedEvents.length === 0) {
    return (
      <section className="container mx-auto py-12 md:py-20 px-4">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-lg font-medium text-orange-500 mb-1">Todos los</h2>
          <h3 className="text-black text-3xl md:text-5xl font-black">EVENTOS</h3>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">No hay eventos disponibles</p>
        </div>
      </section>
    )
  }

  return (
    <section className="container mx-auto py-12 md:py-20 px-4">
      <div className="mb-8 md:mb-12 text-center">
        <h2 className="text-lg font-medium text-orange-500 mb-1">Todos los</h2>
        <h3 className="text-black text-3xl md:text-5xl font-black">EVENTOS</h3>
      </div>

      {/* Mobile Layout */}
      <div className="block lg:hidden space-y-6">
        {formattedEvents.map((event) => (
          <div key={event.id} className="bg-gray-900 rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <Image 
                src={event.image || "/placeholder.svg"} 
                alt={event.title} 
                fill 
                className="object-cover rounded-t-2xl" 
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{event.date.day}</div>
                  <div className="text-sm font-bold text-orange-500">{event.date.month}</div>
                  <div className="text-xs text-gray-400">{event.date.year}</div>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white mb-2">{event.title}</h4>
                  <p className="text-sm text-gray-300">{event.description}</p>
                </div>
              </div>
              <Link
                href={`/eventos/${event.id}`}
                className="inline-flex items-center bg-orange-500 text-black px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors w-full justify-center"
              >
                Ver más
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid grid-cols-12 gap-8 mb-8">
        {/* Left Column - Events List */}
        <div className="col-span-6 space-y-6">
          {formattedEvents.map((event) => (
            <div key={event.id} className="flex gap-6">
              <div className="relative">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  width={120}
                  height={160}
                  className="object-cover w-[120px] h-full min-h-[160px] rounded-xl"
                />
              </div>
              <div className="flex flex-1">
                <div className="flex flex-col justify-center items-center mr-4">
                  <div className="text-5xl font-bold leading-none text-black">{event.date.day}</div>
                  <div className="uppercase font-bold text-sm text-black">{event.date.month}</div>
                  <div className="w-12 h-0.5 bg-orange-500 my-1"></div>
                  <div className="text-sm text-black">{event.date.year}</div>
                </div>
                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h4 className="font-bold text-xl">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1 mb-4">{event.description}</p>
                  </div>
                  <div>
                    <Link
                      href={`/eventos/${event.id}`}
                      className="inline-flex items-center bg-orange-500 text-black px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
                    >
                      Ver más
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right Column - Main Event Card with Fixed Size */}
        <div className="col-span-6">
          <div className="bg-black text-white rounded-3xl overflow-hidden w-full h-[700px] flex flex-col">
            {mainEvent ? (
              <div className="relative p-6 flex flex-col h-full justify-between">
                <div className="flex-1">
                  <div className="relative rounded-2xl overflow-hidden mb-6">
                    <Image
                      src={mainEvent.image || "/placeholder.svg"}
                      alt={mainEvent.title}
                      width={600}
                      height={200}
                      className="object-cover w-full h-[200px] rounded-xl"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="bg-white/80 rounded-full p-4 hover:bg-white transition-colors">
                        <Play className="h-8 w-8 text-orange-500 fill-orange-500" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 mb-6">
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-gray-400 mb-2">Días</div>
                        <div className="text-2xl font-bold bg-gray-800 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.days}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-gray-400 mb-2">Horas</div>
                        <div className="text-2xl font-bold bg-gray-800 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.hours}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-gray-400 mb-2">Minutos</div>
                        <div className="text-2xl font-bold bg-gray-800 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.minutes}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-gray-400 mb-2">Segundos</div>
                        <div className="text-2xl font-bold bg-gray-800 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.seconds}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-orange-500 font-medium mb-3">Evento más próximo</div>

                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gray-800 p-1.5 rounded">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{mainEvent.eventDate}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-gray-800 p-1.5 rounded">
                      <Clock className="h-4 w-4" />
                    </div>
                    <span className="text-sm">{mainEvent.eventTime}</span>
                  </div>

                  <h4 className="font-bold text-xl mb-3">{mainEvent.title}</h4>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-3">{mainEvent.description}</p>
                </div>

                <div className="flex justify-center w-full mt-4">
                  <Link
                    href={`/eventos/${mainEvent.id}`}
                    className="inline-flex items-center bg-orange-500 text-black px-6 py-3 rounded-full text-sm hover:bg-orange-600 transition-colors"
                  >
                    Ver más
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="h-16 w-16 mx-auto mb-4" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No hay eventos próximos</h3>
                  <p className="text-gray-400">Mantente atento para futuros eventos</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/eventos" className="flex items-center text-gray-500 hover:text-orange-500 transition-colors">
          Todos los eventos
          <ArrowRight className="h-5 w-5 ml-1" />
        </Link>
      </div>
    </section>
  )
}