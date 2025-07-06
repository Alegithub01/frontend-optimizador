"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/context/AuthContext"
import Image from "next/image"
import Link from "next/link"
import { Play, BookOpen } from "lucide-react"
import { api } from "@/lib/api"

interface Course {
  id: number
  title: string
  description: string
  price: string
  discount: string
  image: string
  trailer?: string
}

interface Purchase {
  id: number
  course: Course | null
  amount: string
  type: string
  status: string
  createdAt: string
}

interface CourseWithProgress extends Course {
  // TODO: Implementar en el futuro
  // progress: number
  // totalLessons: number
  // completedLessons: number
  // lastAccessed: string
  purchaseDate: string
}

export default function MiAprendizajePage() {
  const { user, isAuthenticated } = useAuthContext()
  const [courses, setCourses] = useState<CourseWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchMyCourses = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        console.log("📚 Obteniendo compras del usuario...")

        // Obtener todas las compras del usuario usando tu API
        const purchases: Purchase[] = await api.get(`/sales/user/${user.id}/courses`)

        console.log("📥 Compras obtenidas:", purchases)

        // Filtrar solo las compras de cursos que están pagadas y tienen curso asociado
        const paidCourses = purchases.filter(
          (purchase) => purchase.type === "course" && purchase.status === "paid" && purchase.course !== null,
        )

        console.log("✅ Cursos pagados:", paidCourses)

        // Transformar a formato de CourseWithProgress
        const coursesWithProgress: CourseWithProgress[] = paidCourses.map((purchase) => {
          const course = purchase.course!

          return {
            ...course,
            purchaseDate: new Date(purchase.createdAt).toLocaleDateString("es-ES"),
          }
        })

        setCourses(coursesWithProgress)
        console.log("🎯 Cursos procesados:", coursesWithProgress)
      } catch (error: any) {
        console.error("❌ Error fetching user courses:", error)
        setError("Error al cargar tus cursos")
      } finally {
        setLoading(false)
      }
    }

    fetchMyCourses()
  }, [isAuthenticated, user])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando tus cursos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Aprendizaje</h1>
          <p className="text-gray-600">Continúa con tus cursos y alcanza tus objetivos</p>
          {courses.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Tienes {courses.length} curso{courses.length !== 1 ? "s" : ""} disponible{courses.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes cursos</h3>
            <p className="text-gray-600 mb-6">Explora nuestro catálogo y comienza tu aprendizaje</p>
            <Link
              href="/cursos"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Explorar cursos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-xl shadow-md overflow-hidden border">
                <div className="relative h-48">
                  <Image
                    src={course.image || "/placeholder.svg?height=200&width=300"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                      <Play className="h-6 w-6 text-orange-500 ml-1" />
                    </div>
                  </div>

                  {/* Badge de curso pagado */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">✓ Pagado</span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                  {/* TODO: Implementar en el futuro - Sistema de progreso */}
                  {/* 
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Progreso</span>
                      <span className="text-sm font-medium text-orange-500">{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  */}

                  {/* TODO: Implementar en el futuro - Estadísticas de lecciones y último acceso */}
                  {/* 
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {course.completedLessons}/{course.totalLessons} lecciones
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Último: {course.lastAccessed}</span>
                    </div>
                  </div>
                  */}

                  {/* Información de compra */}
                  <div className="text-xs text-gray-500 mb-4">Comprado el: {course.purchaseDate}</div>

                  <Link
                    href={`/mi-aprendizaje/${course.id}`}
                    className="w-full bg-orange-500 text-black py-2 px-4 rounded-full hover:bg-orange-600 transition-colors text-center block"
                  >
                    Continuar aprendiendo
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
