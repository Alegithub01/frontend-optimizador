"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Upload, X, Play, Maximize2 } from "lucide-react"

interface VideoFile {
  id: string
  file: File
  url: string
  name: string
}

export default function VideoUploader() {
  const [videoFiles, setVideoFiles] = useState<VideoFile[]>([])
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    files.forEach((file) => {
      if (videoFiles.length >= 3) return

      if (file.type === "video/mp4") {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const url = URL.createObjectURL(file)

        setVideoFiles((prev) => [...prev, { id, file, url, name: file.name }])
      }
    })

    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const removeVideoFile = (id: string) => {
    const file = videoFiles.find((f) => f.id === id)
    if (file) {
      URL.revokeObjectURL(file.url)
    }
    setVideoFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const toggleVideoPlay = (videoId: string, videoElement: HTMLVideoElement) => {
    if (playingVideo === videoId) {
      videoElement.pause()
      setPlayingVideo(null)
    } else {
      // Pause all other videos
      videoFiles.forEach((file) => {
        if (file.id !== videoId) {
          const otherVideo = document.getElementById(`video-${file.id}`) as HTMLVideoElement
          if (otherVideo) {
            otherVideo.pause()
          }
        }
      })
      videoElement.play()
      setPlayingVideo(videoId)
    }
  }

  const toggleFullscreen = (videoElement: HTMLVideoElement) => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      videoElement.requestFullscreen()
    }
  }

  return (
    <div className="w-full space-y-6">
      <h6 className="font-black">Elige el caleidoscopio que te inspire:</h6>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Archivos de Video ({videoFiles.length}/3)</h3>
          <Button
            onClick={() => videoInputRef.current?.click()}
            disabled={videoFiles.length >= 3}
            size="sm"
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir MP4
          </Button>
        </div>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/mp4"
          multiple
          onChange={handleVideoUpload}
          className="hidden"
        />

        {videoFiles.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-center gap-6 overflow-x-auto pb-4">
              {videoFiles.map((videoFile) => (
                <div key={videoFile.id} className="flex-shrink-0 w-52 space-y-2">
                  <div className="relative group">
                    <video
                      id={`video-${videoFile.id}`}
                      src={videoFile.url}
                      className="w-full h-36 rounded-xl object-cover shadow-lg"
                      onPlay={() => setPlayingVideo(videoFile.id)}
                      onPause={() => setPlayingVideo(null)}
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/90 hover:bg-white text-black rounded-full w-12 h-12 p-0"
                        onClick={() => {
                          const video = document.getElementById(`video-${videoFile.id}`) as HTMLVideoElement
                          toggleVideoPlay(videoFile.id, video)
                        }}
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    </div>

                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 w-8 h-8 p-0 rounded-full"
                      onClick={() => removeVideoFile(videoFile.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute top-2 left-2 w-8 h-8 p-0 rounded-full bg-white/90 hover:bg-white text-black"
                      onClick={() => {
                        const video = document.getElementById(`video-${videoFile.id}`) as HTMLVideoElement
                        toggleFullscreen(video)
                      }}
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600 truncate text-center">{videoFile.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
