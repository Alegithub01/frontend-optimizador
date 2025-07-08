"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/context/AuthContext"
import { api } from "@/lib/api"

interface AccessVerificationResult {
  hasAccess: boolean
  loading: boolean
  error: string | null
}

export function useAccessToCourse(courseId: string): AccessVerificationResult {
  const { user, isAuthenticated } = useAuthContext()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      if (!courseId || courseId === "" || !isAuthenticated || !user) {
        console.log("❌ No se puede verificar acceso - faltan datos:", { courseId, isAuthenticated, userId: user?.id })
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log(`🔍 Verificando acceso al curso ${courseId} para usuario ${user.id}`)
        const response = await api.get<{ access: boolean }>(`/sales/user/${user.id}/can-access-course/${courseId}`)
        console.log(`✅ Respuesta de acceso al curso ${courseId}:`, response)

        const accessGranted = response.access === true
        setHasAccess(accessGranted)
        console.log(`🎯 Estado final de acceso al curso: ${accessGranted}`)
      } catch (error) {
        console.error("❌ Error verificando acceso al curso:", error)
        setError("Error al verificar el acceso")
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [courseId, isAuthenticated, user])

  return { 
    hasAccess: hasAccess === true, 
    loading, 
    error 
  }
}

export function useAccessToProduct(productId: string): AccessVerificationResult {
  const { user, isAuthenticated } = useAuthContext()
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkAccess = async () => {
      if (!productId || productId === "" || productId === "__skip__" || !isAuthenticated || !user) {
        console.log("❌ No se puede verificar acceso - faltan datos:", { productId, isAuthenticated, userId: user?.id })
        setHasAccess(false)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        console.log(`🔍 Verificando acceso al producto ${productId} para usuario ${user.id}`)
        const response = await api.get<{ access: boolean }>(`/sales/user/${user.id}/can-access-product/${productId}`)
        console.log(`✅ Respuesta de acceso al producto ${productId}:`, response)

        const accessGranted = response.access === true
        setHasAccess(accessGranted)
        console.log(`🎯 Estado final de acceso al producto: ${accessGranted}`)
      } catch (error) {
        console.error("❌ Error verificando acceso al producto:", error)
        setError("Error al verificar el acceso")
        setHasAccess(false)
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [productId, isAuthenticated, user])

  return { 
    hasAccess: hasAccess === true, 
    loading, 
    error 
  }
}