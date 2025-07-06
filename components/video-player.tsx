// components/VideoPlayer.tsx
"use client"

import { useState, useRef } from "react"
import Image from "next/image"

interface VideoPlayerProps {
  videoUrl: string
  title: string
}

export default function VideoPlayer({ videoUrl, title }: VideoPlayerProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const extractVimeoId = (url: string): string => {
    const match = url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/)
    return match ? match[1] : ""
  }

  const getVimeoThumbnail = (url: string) => {
    const vimeoId = extractVimeoId(url)
    return vimeoId ? `https://vumbnail.com/${vimeoId}.jpg` : "/placeholder.svg"
  }

  const getVimeoEmbedUrl = (url: string) => {
    const vimeoId = extractVimeoId(url)
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1&controls=1&responsive=1&title=0&byline=0&portrait=0&badge=0&autopause=0&dnt=1`
  }

  const thumbnail = getVimeoThumbnail(videoUrl)
  const embedUrl = getVimeoEmbedUrl(videoUrl)

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden backdrop-blur-sm w-full max-w-full">
      {/* Video Container */}
      <div className="relative w-full aspect-video mx-2 sm:mx-4 my-2 sm:my-4 rounded-xl overflow-hidden shadow-lg">
        {!isVideoPlaying ? (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setIsVideoPlaying(true)}
          >
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=400&width=800"
              }}
            />
            <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/80 text-white px-2 py-1 rounded text-xs sm:text-sm">
              Video
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={embedUrl}
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
    </div>
  )
}
