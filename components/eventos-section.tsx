"use client"

import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Play, Calendar, Clock, Pause, X, ChevronRight } from "lucide-react"
import { useEvents } from "@/hooks/useEvent"
import VimeoPlayer from "./VimeoPlayer"

interface BackendEvent {
  id: string
  title: string
  description: string
  image: string
  dateTime: string
  trailerUrl?: string
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
  trailerUrl?: string
  originalDateTime: string
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
  const [showVideo, setShowVideo] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)

  const getFirstSentence = (text: string) => {
    const firstPeriod = text.indexOf(".")
    return firstPeriod !== -1 ? text.substring(0, firstPeriod + 1) : text
  }

  useEffect(() => {
    if (events && events.length > 0) {
      const now = new Date().getTime()

      const formatted = events.map((event: BackendEvent) => {
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
          trailerUrl: event.trailerUrl,
          originalDateTime: event.dateTime,
        }
      })

      // Sort events by date (closest first)
      const sortedEvents = [...formatted].sort((a, b) => {
        return new Date(a.originalDateTime).getTime() - new Date(b.originalDateTime).getTime()
      })

      setFormattedEvents(sortedEvents)

      // Find the closest upcoming event
      const upcomingEvents = sortedEvents.filter((event) => {
        return new Date(event.originalDateTime).getTime() > now
      })

      const closestEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : sortedEvents[0]

      if (closestEvent) {
        const eventDate = new Date(closestEvent.originalDateTime)
        const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }
        const formattedDate = eventDate.toLocaleDateString("es-ES", options)
        const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" }
        const formattedTime = eventDate.toLocaleTimeString("es-ES", timeOptions)

        setMainEvent({
          ...closestEvent,
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

  const handlePlayVideo = () => {
    if (mainEvent?.trailerUrl) {
      setShowVideo(true)
      setIsPlaying(true)
      setVideoLoaded(true)
    }
  }

  const handleCloseVideo = () => {
    setShowVideo(false)
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play()
        setIsPlaying(true)
      } else {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const formatMobileDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "numeric",
      month: "long",
    }
    return date.toLocaleDateString("es-ES", options)
  }

  if (loading) {
    return (
      <section className="container mx-auto py-12 md:py-20 px-4">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-lg font-medium text-orange-500 mb-1">Categoría</h2>
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
    <>
      {/* Vimeo Player API Script - Solo en cliente */}
      {typeof window !== "undefined" && <script src="https://player.vimeo.com/api/player.js" async />}

      <section className="container mx-auto py-12 md:py-20 px-4">
        <div className="mb-8 md:mb-12 text-center">
          <h2 className="text-lg font-medium text-orange-500 mb-1">Todos los</h2>
          <h3 className="text-black text-3xl md:text-5xl font-black">EVENTOS</h3>
        </div>

        {/* Mobile Layout */}
        <div className="block lg:hidden space-y-6">
          {/* Evento Principal en Mobile */}
          {mainEvent && (
            <div className="bg-gray-1 rounded-2xl overflow-hidden">
              <div className="relative aspect-video bg-black">
                {showVideo && mainEvent.trailerUrl ? (
                  <div className="relative w-full h-full">
                    <button
                      onClick={handleCloseVideo}
                      className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>

                    {/* Aquí se renderiza el reproductor */}
                    <VimeoPlayer videoUrl={mainEvent.trailerUrl} />
                  </div>
                ) : (
                  <>
                    <Image
                      src={mainEvent.image || "/placeholder.svg"}
                      alt={mainEvent.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                    {mainEvent.trailerUrl && (
                      <button
                        onClick={handlePlayVideo}
                        className="absolute inset-0 m-auto bg-white/90 rounded-full p-4 hover:bg-white transition-colors shadow-lg hover:scale-105 transform duration-200 w-16 h-16 flex items-center justify-center"
                      >
                        <Play className="h-8 w-8 text-orange-700 fill-orange-700 ml-1" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Countdown Mobile - Movido debajo del video */}
              <div className="grid grid-cols-4 gap-3 p-6 pb-0">
                <div className="text-center bg-gray-4 rounded-lg p-2">
                  <div className="text-xs text-white mb-1">Días</div>
                  <div className="text-xl font-black">{countdown.days}</div>
                </div>
                <div className="text-center bg-gray-4 rounded-lg p-2">
                  <div className="text-xs text-white mb-1">Horas</div>
                  <div className="text-xl font-black">{countdown.hours}</div>
                </div>
                <div className="text-center bg-gray-4 rounded-lg p-2">
                  <div className="text-xs text-white mb-1">Min</div>
                  <div className="text-xl font-black">{countdown.minutes}</div>
                </div>
                <div className="text-center bg-gray-4 rounded-lg p-2">
                  <div className="text-xs text-white mb-1">Seg</div>
                  <div className="text-xl font-black">{countdown.seconds}</div>
                </div>
              </div>

              {/* Fecha y hora - Movido debajo del contador */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Calendar className="h-4 w-4 text-white" />
                  <span>{formatMobileDate(mainEvent.originalDateTime)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-white" />
                  <span>{mainEvent.eventTime}</span>
                </div>
              </div>

              <div className="p-6 pt-4">
                <div className="mb-4">
                  <h4 className="font-bold text-xl text-white mb-2">{mainEvent.title}</h4>
                  <p className="text-sm text-gray-300 mb-3">{mainEvent.description}</p>
                </div>

                <Link
                  href={`/eventos/${mainEvent.id}`}
                  className="inline-flex items-center bg-orange-700 text-black px-6 py-3 rounded-full text-sm hover:bg-orange-600 transition-colors w-full justify-center font-medium"
                >
                  Ver más
                  <img src="/botones/arrowRigthP.svg" alt="Flecha" className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Lista de otros eventos en Mobile */}
          {formattedEvents
            .filter((event) => (mainEvent ? event.id !== mainEvent.id : true))
            .map((event) => (
              <div key={event.id} className="rounded-2xl overflow-hidden">
                <div className="relative aspect-video">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Dark overlay with content */}
                  <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-6">
                    <div className="flex items-center gap-4 w-full">
                      <div className="text-center flex-shrink-0 flex flex-col justify-center">
                        <div className="text-4xl font-black text-white">{event.date.day}</div>
                        <div className="text-xl font-black text-white">{event.date.month}</div>
                        <div className="w-12 h-0.5 bg-orange-700 my-1"></div>
                        <div className="text-xl font-extrabold text-white">{event.date.year}</div>
                      </div>
                      <div className="flex-1 min-h-0">
                        <h4 className="font-bold text-lg text-white mb-2 line-clamp-2">{event.title}</h4>
                        <p className="text-sm text-white mb-3 line-clamp-2">{getFirstSentence(event.description)}</p>
                        <Link
                          href={`/eventos/${event.id}`}
                          className="inline-flex items-center bg-orange-700 text-black px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
                        >
                          Ver más
                          <img src="/botones/arrowRigthP.svg" alt="Flecha" className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
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
                <div className="relative w-[198px] h-[205px] flex-shrink-0 overflow-hidden rounded-xl">
                  <Image
                    src={event.image || "/placeholder.svg"}
                    alt={event.title}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>
                <div className="flex flex-1">
                  <div className="flex flex-col justify-center items-center mr-4">
                    <div className="text-5xl font-black leading-none text-black">{event.date.day}</div>
                    <div className="uppercase font-black text-2xl text-black">{event.date.month}</div>
                    <div className="w-12 h-0.5 bg-orange-700 my-1"></div>
                    <div className="text-xl font-black text-black">{event.date.year}</div>
                  </div>
                  <div className="flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-extrabold text-xl text-black">{event.title}</h4>
                      <p className="text-sm text-black mt-1 mb-4 line-clamp-2">{event.description}</p>
                    </div>
                    <div>
                      <Link
                        href={`/eventos/${event.id}`}
                        className="inline-flex items-center bg-orange-700 text-black px-4 py-2 rounded-full text-sm hover:bg-orange-600 transition-colors"
                      >
                        Ver más
                        <img src="/botones/arrowRigthP.svg" alt="Flecha" className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Main Event Card */}
          <div className="col-span-6">
            <div className="bg-gray-1 text-white rounded-3xl overflow-hidden w-full min-h-[700px] h-auto flex flex-col">
              {mainEvent ? (
                <div className="relative p-6 flex flex-col h-full">
                  {/* Video/Image Section */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden flex-shrink-0 bg-black">
                    {showVideo && mainEvent.trailerUrl ? (
                      <div className="relative w-full h-full">
                        <button
                          onClick={handleCloseVideo}
                          className="absolute top-4 right-4 z-50 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>

                        {/* Aquí se renderiza el reproductor */}
                        <VimeoPlayer videoUrl={mainEvent.trailerUrl} />
                      </div>
                    ) : (
                      <>
                        <Image
                          src={mainEvent.image || "/placeholder.svg"}
                          alt={mainEvent.title}
                          fill
                          className="object-cover rounded-xl"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority
                        />
                        {mainEvent.trailerUrl && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-xl">
                            <button
                              onClick={handlePlayVideo}
                              className="bg-white/90 rounded-full p-4 hover:bg-white transition-colors shadow-lg hover:scale-105 transform duration-200"
                            >
                              <Play className="h-8 w-8 text-orange-500 fill-orange-500 ml-1" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Countdown Section */}
                  <div className="grid grid-cols-4 gap-3 my-6">
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-white mb-2">Días</div>
                        <div className="text-2xl font-black bg-gray-4 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.days}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-white mb-2">Horas</div>
                        <div className="text-2xl font-black bg-gray-4 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.hours}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-white mb-2">Minutos</div>
                        <div className="text-2xl font-black bg-gray-4 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.minutes}
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 bg-white rounded-full mb-2"></div>
                        <div className="text-xs text-white mb-2">Segundos</div>
                        <div className="text-2xl font-black bg-gray-4 rounded-lg w-14 h-14 flex items-center justify-center">
                          {countdown.seconds}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Info Section */}
                  <div className="flex-1 flex flex-col">
                    <div className="text-sm text-orange-500 font-medium mb-3">Evento más próximo</div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gray-800 p-1.5 rounded">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm">{mainEvent.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-gray-800 p-1.5 rounded">
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-sm">{mainEvent.eventTime}</span>
                    </div>
                    <h4 className="font-bold text-xl mb-3">{mainEvent.title}</h4>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-3">{mainEvent.description}</p>

                    <div className="mt-auto pt-4">
                      <Link
                        href={`/eventos/${mainEvent.id}`}
                        className="inline-flex items-center bg-orange-700 text-black px-6 py-3 rounded-full text-sm hover:bg-orange-600 transition-colors w-full justify-center font-medium"
                      >
                        Ver más
                        <img src="/botones/arrowRigthP.svg" alt="Flecha" className="h-3 w-3" />
                      </Link>
                    </div>
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
          {/* Mobile version - circular button */}
          <Link
            href="/eventos"
            className="mt-16 lg:hidden bg-orange-700 text-black p-4 rounded-full hover:bg-orange-500 transition text-lg px-4 py-2 flex items-center gap-2"
          >
            Todos los eventos
            <img src="/botones/arrowRigth.svg" alt="Flecha" className="h-6 w-6" />
          </Link>

          {/* Desktop version - original style */}
          <Link
            href="/eventos"
            className="hidden lg:flex items-center text-gray-2 font-semibold hover:text-orange-500 transition-colors text-lg px-4 py-2"
          >
            Todos los eventos
            <ChevronRight className="h-6 w-6 ml-2" />
          </Link>
        </div>
      </section>
    </>
  )
}
