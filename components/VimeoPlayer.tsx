// components/VimeoPlayer.tsx
"use client"

interface VimeoPlayerProps {
  videoUrl: string
  title?: string
}

export const VimeoPlayer = ({ videoUrl, title = "Video Vimeo" }: VimeoPlayerProps) => {
  const extractVimeoId = (url: string): string => {
    const match = url.match(/(?:vimeo\.com\/)?(\d+)/)
    return match ? match[1] : ""
  }

  const videoId = extractVimeoId(videoUrl)

  if (!videoId) return <p className="text-red-500">Video no disponible</p>

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden">
      <iframe
        src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&badge=0&autopause=0&dnt=1`}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
        allowFullScreen
        title={title}
      />
    </div>
  )
}
