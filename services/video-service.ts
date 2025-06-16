"use client"

import type React from "react"

export const VideoService = {
  /**
   * Convert video URLs to embed format with maximum restrictions
   */
  getEmbedUrl: (url: string): string => {
    // Vimeo URL conversion with maximum restrictions
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}?background=1&autopause=0&transparent=0&autoplay=0&controls=0&title=0&byline=0&portrait=0&pip=0&dnt=1&responsive=1`
    }

    // YouTube URL conversion with maximum restrictions
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&showinfo=0&iv_load_policy=3&color=white`
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?controls=0&modestbranding=1&rel=0&fs=0&disablekb=1&showinfo=0&iv_load_policy=3&color=white`
    }

    // For direct video files or already embed URLs
    return url
  },

  /**
   * Check if a URL is a video
   */
  isVideoUrl: (url: string): boolean => {
    if (!url) return false

    return (
      url.includes("youtube") ||
      url.includes("vimeo") ||
      url.includes("youtu.be") ||
      url.includes("mp4") ||
      url.endsWith(".mp4") ||
      url.endsWith(".mov") ||
      url.endsWith(".avi")
    )
  },

  /**
   * Control video playback (play/pause)
   */
  togglePlay: (
    isPlaying: boolean,
    iframeRef: React.RefObject<HTMLIFrameElement | null>,
    videoUrl?: string,
  ): boolean => {
    if (!iframeRef.current || !videoUrl) return isPlaying

    try {
      if (isPlaying) {
        // Pause video
        if (videoUrl.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"pause"}', "*")
        } else if (videoUrl.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', "*")
        }
      } else {
        // Play video
        if (videoUrl.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"play"}', "*")
        } else if (videoUrl.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', "*")
        }
      }
      return !isPlaying
    } catch (error) {
      console.error("Error controlling video:", error)
      return isPlaying
    }
  },

  /**
   * Control video volume (mute/unmute)
   */
  toggleMute: (isMuted: boolean, iframeRef: React.RefObject<HTMLIFrameElement | null>, videoUrl?: string): boolean => {
    if (!iframeRef.current || !videoUrl) return isMuted

    try {
      if (isMuted) {
        // Unmute video
        if (videoUrl.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"setVolume","value":"1"}', "*")
        } else if (videoUrl.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"unMute","args":""}', "*")
        }
      } else {
        // Mute video
        if (videoUrl.includes("vimeo")) {
          iframeRef.current.contentWindow?.postMessage('{"method":"setVolume","value":"0"}', "*")
        } else if (videoUrl.includes("youtube")) {
          iframeRef.current.contentWindow?.postMessage('{"event":"command","func":"mute","args":""}', "*")
        }
      }
      return !isMuted
    } catch (error) {
      console.error("Error controlling video volume:", error)
      return isMuted
    }
  },
}
