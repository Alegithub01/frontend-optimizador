"use client"

import { useEffect, useState } from "react"
import { OptikidsForm } from "@/components/optikids/optikids-form"
import type { Optikids } from "@/types/optikids"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"

interface OptikidsDetailPageProps {
  params: {
    id: string
  }
}

export default function OptikidsDetailPage({ params }: OptikidsDetailPageProps) {
  const { id } = params
  const [optikids, setOptikids] = useState<Optikids | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isNew = id === "new"

  useEffect(() => {
    if (!isNew) {
      const fetchOptikids = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await api.get<Optikids>(`/optikids/${id}`)
          setOptikids(data)
        } catch (err: any) {
          setError(err.message || "Error al cargar Optikids.")
          toast({ title: "Error", description: err.message || "Error al cargar Optikids.", variant: "destructive" })
        } finally {
          setLoading(false)
        }
      }
      fetchOptikids()
    } else {
      setLoading(false)
    }
  }, [id, isNew])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando Optikids...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return <OptikidsForm initialOptikids={optikids} isNew={isNew} />
}
