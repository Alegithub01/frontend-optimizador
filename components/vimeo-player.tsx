"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Maximize } from "lucide-react"

interface VimeoPlayerProps {
  videoId: string
  hash?: string
  title?: string
  className?: string
  autoplay?: boolean
  showTitle?: boolean
}

export default function VimeoPlayer({
  videoId,
  hash,
  title = "Video",
  className = "",
  autoplay = false,
  showTitle = false,
}: VimeoPlayerProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(autoplay)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasError, setHasError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Construir URL de thumbnail de Vimeo
  const getVimeoThumbnail = (id: string) => {
    return `https://vumbnail.com/${id}.jpg`
  }

  // Construir URL de embed de Vimeo con API habilitada
  const getVimeoEmbedUrl = (id: string, hashParam?: string) => {
    const url = `https://player.vimeo.com/video/${id}?`
    const params = new URLSearchParams()

    if (hashParam) {
      params.append("h", hashParam)
    }

    // Parámetros para controles personalizados
    params.append("autoplay", autoplay ? "1" : "0")
    params.append("controls", "0") // Deshabilitamos controles nativos para usar los nuestros
    params.append("responsive", "1")
    params.append("title", "0")
    params.append("byline", "0")
    params.append("portrait", "0")
    params.append("speed", "0")
    params.append("badge", "0")
    params.append("autopause", "0")
    params.append("player_id", "0")
    params.append("app_id", "58479")
    params.append("dnt", "1")
    params.append("pip", "0")
    params.append("api", "1") // Habilitar API para controles externos

    return url + params.toString()
  }

  // Controles del video
  const togglePlayPause = () => {
    if (!iframeRef.current) return

    try {
      if (isPlaying) {
        iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', "*")
        setIsPlaying(false)
      } else {
        iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Error controlling video:", error)
    }
  }

  const skipForward = () => {
    if (!iframeRef.current) return

    try {
      const newTime = currentTime + 10
      iframeRef.current.contentWindow?.postMessage(`{"method":"setCurrentTime","value":${newTime}}`, "*")
      setCurrentTime(newTime)
    } catch (error) {
      console.error("Error skipping forward:", error)
    }
  }

  const skipBackward = () => {
    if (!iframeRef.current) return

    try {
      const newTime = Math.max(0, currentTime - 10)
      iframeRef.current.contentWindow?.postMessage(`{"method":"setCurrentTime","value":${newTime}}`, "*")
      setCurrentTime(newTime)
    } catch (error) {
      console.error("Error skipping backward:", error)
    }
  }

  const restartVideo = () => {
    if (!iframeRef.current) return

    try {
      iframeRef.current.contentWindow?.postMessage('{"method":"setCurrentTime","value":0}', "*")
      iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
      setIsPlaying(true)
      setCurrentTime(0)
    } catch (error) {
      console.error("Error restarting video:", error)
    }
  }

  const toggleFullscreen = () => {
    if (!iframeRef.current) return

    try {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen()
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error)
    }
  }

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Escuchar eventos del video de Vimeo
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com") return

      try {
        const data = JSON.parse(event.data)

        // Video listo para reproducir
        if (data.event === "ready") {
          if (autoplay) {
            setIsPlaying(true)
          }
        }

        // Actualización de tiempo
        if (data.event === "timeupdate" && data.data) {
          setCurrentTime(data.data.seconds)
          setDuration(data.data.duration)
        }

        // Estado de reproducción
        if (data.event === "play") {
          setIsPlaying(true)
        }

        if (data.event === "pause") {
          setIsPlaying(false)
        }

        // Video terminado
        if (data.event === "ended") {
          setIsPlaying(false)
        }
      } catch (error) {
        // Ignorar errores de parsing
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [autoplay])

  // Auto-iniciar video si autoplay está habilitado
  useEffect(() => {
    if (autoplay && videoId) {
      setIsVideoPlaying(true)
    }
  }, [autoplay, videoId])

  if (!videoId) {
    return (
      <div className={`relative bg-gray-200 rounded-2xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-2">📹</div>
            <p className="text-gray-600 text-sm">Configura el ID del video de Vimeo</p>
          </div>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className={`relative bg-gray-200 rounded-2xl overflow-hidden ${className}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-600 text-sm">Error cargando video</p>
            <button onClick={() => setHasError(false)} className="text-blue-500 text-xs mt-1 underline">
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden w-full ${className}`}>
      {/* Header opcional */}
      {showTitle && (
        <div className="p-3 sm:p-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white">
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      )}

      {/* Video Container */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
        {!isVideoPlaying ? (
          // Thumbnail View
          <div className="absolute inset-0 cursor-pointer group" onClick={() => setIsVideoPlaying(true)}>
            <Image
              src={getVimeoThumbnail(videoId) || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=400&width=800"
              }}
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/95 rounded-full flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-2xl border-2 sm:border-4 border-white/50">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-orange-500 ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
        ) : (
          // Video Player
          <div className="relative w-full h-full">
            <iframe
              ref={iframeRef}
              src={getVimeoEmbedUrl(videoId, hash)}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              title={title}
              onError={() => setHasError(true)}
              style={{
                border: "none",
                outline: "none",
              }}
            />

            {/* Controles superpuestos */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 sm:p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
              {/* Información del tiempo */}
              <div className="flex items-center justify-between mb-3 text-white text-xs sm:text-sm">
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500" : "bg-red-500"}`}></div>
                  <span className="hidden sm:inline">{isPlaying ? "Reproduciendo" : "Pausado"}</span>
                </div>
              </div>

              {/* Botones de control */}
              <div className="flex items-center justify-center gap-2">
                {/* Reiniciar */}
                <button
                  onClick={restartVideo}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all duration-200"
                  title="Reiniciar"
                >
                  <RotateCcw className="h-4 w-4 text-white" />
                </button>

                {/* Retroceder */}
                <button
                  onClick={skipBackward}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all duration-200"
                  title="Retroceder 10s"
                >
                  <SkipBack className="h-4 w-4 text-white" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={togglePlayPause}
                  className="p-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-all duration-200"
                  title={isPlaying ? "Pausar" : "Reproducir"}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 text-white" fill="currentColor" />
                  ) : (
                    <Play className="h-5 w-5 text-white ml-1" fill="currentColor" />
                  )}
                </button>

                {/* Adelantar */}
                <button
                  onClick={skipForward}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all duration-200"
                  title="Adelantar 10s"
                >
                  <SkipForward className="h-4 w-4 text-white" />
                </button>

                {/* Pantalla completa */}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-all duration-200"
                  title="Pantalla completa"
                >
                  <Maximize className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
