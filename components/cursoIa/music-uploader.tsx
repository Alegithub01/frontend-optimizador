"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Play, Pause, Upload, Maximize2 } from "lucide-react"

interface MusicFile {
  id: string
  file: File
  url: string
  name: string
  duration: string
}

interface ImageFile {
  id: string
  file: File
  url: string
  name: string
}

export default function MusicUploader() {
  const [musicFiles, setMusicFiles] = useState<MusicFile[]>([])
  const [imageFile, setImageFile] = useState<ImageFile | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [expandedImage, setExpandedImage] = useState(false)
  const musicInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({})

  const handleMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    files.forEach((file) => {
      if (musicFiles.length >= 3) return

      if (file.type.startsWith("audio/")) {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const url = URL.createObjectURL(file)

        const audio = new Audio(url)
        audio.addEventListener("loadedmetadata", () => {
          const minutes = Math.floor(audio.duration / 60)
          const seconds = Math.floor(audio.duration % 60)
          const duration = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}min`

          setMusicFiles((prev) => [...prev, { id, file, url, name: file.name, duration }])
        })
      }
    })

    if (musicInputRef.current) {
      musicInputRef.current.value = ""
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      const url = URL.createObjectURL(file)
      setImageFile({ id, file, url, name: file.name })
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const removeMusicFile = (id: string) => {
    const file = musicFiles.find((f) => f.id === id)
    if (file) {
      URL.revokeObjectURL(file.url)
      if (audioRefs.current[id]) {
        audioRefs.current[id].pause()
        delete audioRefs.current[id]
      }
    }
    setMusicFiles((prev) => prev.filter((f) => f.id !== id))
    if (playingId === id) {
      setPlayingId(null)
    }
  }

  const togglePlay = (musicId: string) => {
    const musicFile = musicFiles.find((f) => f.id === musicId)
    if (!musicFile) return

    if (playingId === musicId) {
      audioRefs.current[musicId]?.pause()
      setPlayingId(null)
    } else {
      Object.keys(audioRefs.current).forEach((id) => {
        if (id !== musicId) {
          audioRefs.current[id]?.pause()
        }
      })

      if (!audioRefs.current[musicId]) {
        audioRefs.current[musicId] = new Audio(musicFile.url)
        audioRefs.current[musicId].addEventListener("ended", () => setPlayingId(null))
      }
      audioRefs.current[musicId].play()
      setPlayingId(musicId)
    }
  }

  const toggleFullscreen = () => {
    setExpandedImage(!expandedImage)
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h6 className="font-black">Reproduce la música que más te guste:</h6>
          <Button
            onClick={() => musicInputRef.current?.click()}
            disabled={musicFiles.length >= 3}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600 text-black"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Música ({musicFiles.length}/3)
          </Button>
        </div>

        {musicFiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">Sube archivos de música para reproducir (máximo 3)</p>
          </div>
        ) : (
          <div className="space-y-2">
            {musicFiles.map((musicFile) => (
              <div key={musicFile.id} className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-full w-10 h-10 p-0 bg-white border border-gray-300 hover:bg-gray-50"
                    onClick={() => togglePlay(musicFile.id)}
                  >
                    {playingId === musicFile.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </Button>
                  <span className="text-gray-900 font-medium">{musicFile.name.replace(/\.[^/.]+$/, "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">{musicFile.duration || "00:00min"}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => removeMusicFile(musicFile.id)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <input
          ref={musicInputRef}
          type="file"
          accept="audio/*"
          multiple
          onChange={handleMusicUpload}
          className="hidden"
        />
      </div>

      <div className="space-y-4">
        <h6 className="font-black">Sube la imagen que creaste anteriormente y visualízala:</h6>

        {!imageFile ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors max-w-md mx-auto aspect-square flex flex-col items-center justify-center"
            onClick={() => imageInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">Sube tu imagen previamente creada</p>
          </div>
        ) : (
          <div className="relative max-w-md mx-auto">
            <img
              id="uploaded-image"
              src={imageFile.url || "/placeholder.svg"}
              alt={imageFile.name}
              className="w-full aspect-square rounded-lg object-cover cursor-pointer"
              onClick={toggleFullscreen}
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white text-black"
              onClick={toggleFullscreen}
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {expandedImage && imageFile && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
            onClick={toggleFullscreen}
          >
            <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
              <img
                src={imageFile.url || "/placeholder.svg"}
                alt={imageFile.name}
                className="max-w-full max-h-full object-contain"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white text-black"
                onClick={toggleFullscreen}
              >
                ×
              </Button>
            </div>
          </div>
        )}

        <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      </div>
    </div>
  )
}
