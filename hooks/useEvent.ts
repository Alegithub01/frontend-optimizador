"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"

interface Event {
  id: string
  title: string
  description: string
  image: string
  dateTime: string // del backend como ISO string
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await api.get<Event[]>("/event")
        setEvents(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return { events, loading, error }
}
