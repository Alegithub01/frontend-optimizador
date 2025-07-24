"use client"

import React, { useState, useRef } from "react"
import { Play, Pause, Volume2 } from "lucide-react"

interface MusicTrack {
  title: string
  url: string
}

interface MusicPlayerListProps {
  tracks: MusicTrack[]
}

const MusicPlayerList: React.FC<MusicPlayerListProps> = ({ tracks }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null)
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])

  const togglePlay = (index: number) => {
    const audio = audioRefs.current[index]
    if (!audio) return

    if (audio.paused) {
      // Pausar todos los demás
      audioRefs.current.forEach((a, i) => {
        if (i !== index && a) a.pause()
      })
      audio.play()
      setCurrentTrackIndex(index)
    } else {
      audio.pause()
      setCurrentTrackIndex(null)
    }
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {tracks.slice(0, 3).map((track, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-md">
          <div className="flex items-center gap-4">
            <button
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
              onClick={() => togglePlay(index)}
            >
              {currentTrackIndex === index ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <div>
              <h4 className="font-semibold text-lg">{track.title}</h4>
              <audio
                ref={(el) => {
                audioRefs.current[index] = el
                }}
                src={track.url}
                preload="auto"
                onEnded={() => setCurrentTrackIndex(null)}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MusicPlayerList
