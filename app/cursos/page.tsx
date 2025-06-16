"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"

interface Course {
  id: number
  title: string
  description: string
  category: string
  price: number
  originalPrice?: number
  discount?: number
  image: string
  hasVideo?: boolean
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const data = await api.get<Course[]>("/courses")
        setCourses(data)
      } catch (error) {
        console.error("Error:", error)
        // fallback de cursos
        setCourses([
          {
            id: 1,
            title: "DESAFÍO DE LOS 7 DÍAS",
            description: "Crea y valida tu idea de negocio desde cero, con pasos claros y estratégicos.",
            category: "Negocio",
            price: 20,
            originalPrice: 50,
            discount: 50,
            image: "https://vimeo.com/manage/videos/1080215077",
            hasVideo: true,
          },
          {
            id: 2,
            title: "CÁPSULA MENSUAL",
            description:
              "Optimiza tus ventas con estrategias comerciales que integran lo físico y lo digital eficazmente.",
            category: "Negocio",
            price: 50,
            originalPrice: 0,
            discount: 0,
            image: "/capsula-emprendedores.jpg",
            hasVideo: true,
          },
          {
            id: 3,
            title: "ESCUELA FINANCIERA: GUÍA PARA PADRES",
            description:
              "Guía para que padres y tutores enseñen finanzas a sus hijos con juegos, valores y responsabilidad.",
            category: "Finanzas",
            price: 100,
            originalPrice: 50,
            discount: 95,
            image: "/tinder-emprendedores.jpg",
            hasVideo: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const handleCourseClick = (courseId: number) => {
    router.push(`/cursos/${courseId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl">Cargando cursos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">Todos los</h2>
          <h1 className="text-5xl md:text-6xl font-black">CURSOS</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col">
              <div className="relative h-60 w-full mb-4 rounded-lg overflow-hidden">
                <Image
                  src={course.image || "/placeholder.svg?height=300&width=400"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                {course.hasVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-gray-600 mb-4">{course.description}</p>

              <div className="mt-auto">
                <div className="flex items-center">
                  <span className="text-2xl font-bold">${course.price} USD</span>
                  {(course.discount ?? 0) > 0 && (
                    <span className="ml-2 text-red-500 text-sm">
                      {course.discount}% Dto.{" "}
                      <span className="line-through text-gray-500">${course.originalPrice} USD</span>
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-4">Bolivia cambio oficial: 6.96 bs</p>

                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center gap-2 py-6"
                  onClick={() => handleCourseClick(course.id)}
                >
                  Comprar <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-6xl mx-auto rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-700 to-black p-10 text-white text-center">
            <h2 className="text-3xl font-bold mb-2">CONVIERTE EN</h2>
            <h3 className="text-3xl font-bold mb-6">PREMIUM</h3>
            <p className="mb-8 max-w-md mx-auto">Accede a todos los cursos y recursos y asistente de IA</p>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6">Sí quiero ser opitmizado</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
