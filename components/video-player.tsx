"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react"

interface VimeoConfig {
  controls?: boolean;
  responsive?: boolean;
  autoplay?: boolean;
  byline?: boolean;
  portrait?: boolean;
  title?: boolean;
}

interface VideoPlayerProps {
  videoUrl: string;
  title: string;
  vimeoConfig?: VimeoConfig;
}
export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const getVimeoThumbnail = (url: string) => {
    let vimeoId = ""
    if (url.includes("vimeo.com/")) {
      vimeoId = url.split("vimeo.com/")[1].split("?")[0].split("/")[0]
    } else if (url.includes("player.vimeo.com/video/")) {
      vimeoId = url.split("player.vimeo.com/video/")[1].split("?")[0]
    }

    return `https://vumbnail.com/${vimeoId}.jpg`
  }

  const getYouTubeThumbnail = (url: string) => {
    let videoId = ""
    if (url.includes("youtube.com/watch")) {
      videoId = url.split("v=")[1]?.split("&")[0]
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("/").pop()?.split("?")[0] || ""
    }

    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  const getVideoThumbnail = (url: string) => {
    if (url.includes("vimeo")) {
      return getVimeoThumbnail(url)
    } else if (url.includes("youtube") || url.includes("youtu.be")) {
      return getYouTubeThumbnail(url)
    }
    return "/placeholder.svg?height=400&width=800"
  }

  const getVimeoEmbedUrl = (url: string) => {
    let vimeoId = ""
    if (url.includes("vimeo.com/")) {
      vimeoId = url.split("vimeo.com/")[1].split("?")[0].split("/")[0]
    } else if (url.includes("player.vimeo.com/video/")) {
      vimeoId = url.split("player.vimeo.com/video/")[1].split("?")[0]
    }

    // URL con API habilitada para controles personalizados
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&controls=1&responsive=1&title=0&byline=0&portrait=0&speed=0&badge=0&autopause=0&player_id=0&app_id=0&h=0&dnt=1&pip=0&api=1`
  }

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = ""
    if (url.includes("youtube.com/watch")) {
      videoId = url.split("v=")[1]?.split("&")[0]
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("/").pop()?.split("?")[0] || ""
    }

    // URL con API habilitada para controles personalizados
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&fs=1&enablejsapi=1&origin=${window.location.origin}`
  }

  const getVideoEmbedUrl = (url: string) => {
    if (url.includes("vimeo")) {
      return getVimeoEmbedUrl(url)
    } else if (url.includes("youtube") || url.includes("youtu.be")) {
      return getYouTubeEmbedUrl(url)
    }
    return url
  }

  // Controles del video
  const togglePlayPause = () => {
    if (!iframeRef.current) return

    try {
      if (videoUrl.includes("vimeo")) {
        if (isPlaying) {
          iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', "*")
          setIsPlaying(false)
        } else {
          iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
          setIsPlaying(true)
        }
      } else if (videoUrl.includes("youtube")) {
        if (isPlaying) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
          setIsPlaying(false)
        } else {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
          setIsPlaying(true)
        }
      }
    } catch (error) {
      console.error("Error controlling video:", error)
    }
  }

  const skipForward = () => {
    if (!iframeRef.current) return

    try {
      if (videoUrl.includes("vimeo")) {
        // Adelantar 10 segundos desde la posición actual en Vimeo
        const newTime = currentTime + 10
        iframeRef.current.contentWindow?.postMessage(`{"method":"setCurrentTime","value":${newTime}}`, "*")
        setCurrentTime(newTime)
      } else if (videoUrl.includes("youtube")) {
        // Adelantar 10 segundos desde la posición actual en YouTube
        const newTime = currentTime + 10
        iframeRef.current.contentWindow?.postMessage(
          `{"event":"command","func":"seekTo","args":[${newTime}, true]}`,
          "*",
        )
        setCurrentTime(newTime)
      }
    } catch (error) {
      console.error("Error skipping forward:", error)
    }
  }

  const skipBackward = () => {
    if (!iframeRef.current) return

    try {
      if (videoUrl.includes("vimeo")) {
        // Retroceder 10 segundos en Vimeo
        const newTime = Math.max(0, currentTime - 10)
        iframeRef.current.contentWindow?.postMessage(`{"method":"setCurrentTime","value":${newTime}}`, "*")
      } else if (videoUrl.includes("youtube")) {
        // Retroceder 10 segundos en YouTube
        const newTime = Math.max(0, currentTime - 10)
        iframeRef.current.contentWindow?.postMessage(
          `{"event":"command","func":"seekTo","args":[${newTime}, true]}`,
          "*",
        )
      }
    } catch (error) {
      console.error("Error skipping backward:", error)
    }
  }

  const restartVideo = () => {
    if (!iframeRef.current) return

    try {
      if (videoUrl.includes("vimeo")) {
        iframeRef.current.contentWindow?.postMessage('{"method":"setCurrentTime","value":0}', "*")
        iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
        setIsPlaying(true)
      } else if (videoUrl.includes("youtube")) {
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', "*")
        iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
        setIsPlaying(true)
      }
      setCurrentTime(0)
    } catch (error) {
      console.error("Error restarting video:", error)
    }
  }

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Escuchar eventos del video
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://player.vimeo.com" && event.origin !== "https://www.youtube.com") return

      try {
        const data = JSON.parse(event.data)

        if (data.event === "ready" || data.method === "ready") {
          setIsPlaying(true)
        }

        if (data.method === "timeupdate" && data.data) {
          setCurrentTime(data.data.seconds)
          setDuration(data.data.duration)
        }
      } catch (error) {
        // Ignorar errores de parsing
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [])

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm w-full max-w-full">
      {/* Header - Responsive */}
      <div className="p-3 sm:p-4 md:p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Video Player</h3>
        <p className="text-xs sm:text-sm text-gray-500">Controles avanzados de reproducción</p>
      </div>

      {/* Video Container - Fully Responsive */}
      <div className="relative w-full aspect-video mx-2 sm:mx-4 my-2 sm:my-4 rounded-xl overflow-hidden shadow-lg">
        {!isVideoPlaying ? (
          // Thumbnail View
          <div className="absolute inset-0 cursor-pointer group" onClick={() => setIsVideoPlaying(true)}>
            <Image
              src={getVideoThumbnail(videoUrl) || "/placeholder.svg"}
              alt={title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=400&width=800"
              }}
            />

            {/* Play Button Overlay - Responsive */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-all duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white/95 rounded-full flex items-center justify-center group-hover:bg-white group-hover:scale-110 transition-all duration-300 shadow-2xl border-2 sm:border-4 border-white/50">
                <Play className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-orange-500 ml-1" fill="currentColor" />
              </div>
            </div>

            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/80 text-white px-2 py-1 rounded text-xs sm:text-sm">Video</div>
          </div>
        ) : (
          // Video Player
          <iframe
            ref={iframeRef}
            src={getVideoEmbedUrl(videoUrl)}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            title={title}
            style={{
              border: "none",
              outline: "none",
            }}
          ></iframe>
        )}
      </div>

      {/* Controles Personalizados - Responsive */}
      {isVideoPlaying && (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-t from-gray-50 to-white border-t border-gray-100">
          {/* Información del tiempo - Responsive */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 p-2 sm:p-3 bg-gray-50 rounded-lg">
            <div className="text-xs sm:text-sm font-medium text-gray-700">
              <span className="text-orange-500">{formatTime(currentTime)}</span> / {formatTime(duration)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-green-500" : "bg-gray-400"}`}></div>
              <span className="hidden sm:inline">{isPlaying ? "Reproduciendo" : "Pausado"}</span>
            </div>
          </div>

          {/* Botones de control - Responsive Layout */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            {/* Reiniciar */}
            <button
              onClick={restartVideo}
              className="p-2 sm:p-3 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
              title="Reiniciar video"
            >
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>

            {/* Retroceder */}
            <button
              onClick={skipBackward}
              className="p-2 sm:p-3 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
              title="Retroceder 10 segundos"
            >
              <SkipBack className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>

            {/* Play/Pause - Destacado */}
            <button
              onClick={togglePlayPause}
              className="p-3 sm:p-4 bg-gradient-to-b from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-orange-300"
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 sm:h-6 sm:w-6 text-white ml-1" fill="currentColor" />
              )}
            </button>

            {/* Adelantar */}
            <button
              onClick={skipForward}
              className="p-2 sm:p-3 bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
              title="Adelantar 10 segundos"
            >
              <SkipForward className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" />
            </button>

            {/* Volver a miniatura - Responsive text */}
            <button
              onClick={() => {
                setIsVideoPlaying(false)
                setIsPlaying(false)
                setCurrentTime(0)
              }}
              className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-b from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-300"
            >
              <span className="hidden sm:inline">Miniatura</span>
              <span className="sm:hidden">Mini</span>
            </button>

            {/* Pantalla completa - Responsive text */}
            <button
              onClick={() => {
                if (iframeRef.current) {
                  if (iframeRef.current.requestFullscreen) {
                    iframeRef.current.requestFullscreen()
                  }
                }
              }}
              className="px-3 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl border border-blue-400"
              title="Pantalla completa"
            >
              <span className="hidden sm:inline">Expandir</span>
              <span className="sm:hidden">Full</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer cuando no está reproduciendo - Responsive */}
      {!isVideoPlaying && (
        <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <div className="text-xs sm:text-sm font-medium text-gray-700">Estado: Pausado</div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 sm:gap-2">
              <Play className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="text-center sm:text-left">Haz clic en la miniatura para reproducir</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}