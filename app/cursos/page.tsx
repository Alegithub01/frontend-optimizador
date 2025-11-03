"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ShoppingCart, ArrowRightCircle, CheckCircle } from "lucide-react"
import Image from "next/image"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { useCurrency } from "@/hooks/use-currency"

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
  isFree?: boolean
}

interface PurchasedCourse {
  id: number
  course: {
    id: number
    title: string
    description: string
    price: string
    discount: string
    image: string
    trailer: string
  }
  status: string
  type: string
}

export default function CoursesPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { formatPrice, currency, isLoading: currencyLoading } = useCurrency()
  const [courses, setCourses] = useState<Course[]>([])
  const [purchasedCourses, setPurchasedCourses] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [priceSort, setPriceSort] = useState<"asc" | "desc" | "none">("none")
  const [showFreeFirst, setShowFreeFirst] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        const data = await api.get<Course[]>("/courses")
        setCourses(data)
        console.log("📚 Cursos obtenidos:", data)

        if (isAuthenticated && user?.id) {
          try {
            console.log(`🔍 Haciendo fetch a: /sales/user/${user.id}/courses`)
            const purchasedData = await api.get<PurchasedCourse[]>(`/sales/user/${user.id}/courses`)
            console.log("🛒 Respuesta de cursos comprados:", purchasedData)

            const paidCourses = purchasedData.filter((purchase) => purchase.status === "paid")
            const purchasedCourseIds = paidCourses.map((purchase) => purchase.course.id)
            console.log("🛒 IDs de cursos comprados:", purchasedCourseIds)

            setPurchasedCourses(purchasedCourseIds)
          } catch (error) {
            console.error("❌ Error fetching purchased courses:", error)
            setPurchasedCourses([])
          }
        } else {
          setPurchasedCourses([])
        }
      } catch (error) {
        console.error("Error:", error)
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

    if (!authLoading) {
      fetchData()
    }
  }, [authLoading])

  const getFilteredAndSortedCourses = () => {
    let filtered = [...courses]

    if (showFreeFirst) {
      const freeCourses = filtered.filter((c) => c.isFree || c.price === 0)
      const paidCourses = filtered.filter((c) => !c.isFree && c.price > 0)

      // Apply price sorting to each group independently
      if (priceSort !== "none") {
        freeCourses.sort((a, b) => {
          const aPrice = a.price || 0
          const bPrice = b.price || 0
          return priceSort === "asc" ? aPrice - bPrice : bPrice - aPrice
        })

        paidCourses.sort((a, b) => {
          const aPrice = a.price || 0
          const bPrice = b.price || 0
          return priceSort === "asc" ? aPrice - bPrice : bPrice - aPrice
        })
      }

      // Combine: free courses first, then paid courses
      filtered = [...freeCourses, ...paidCourses]
    } else if (priceSort !== "none") {
      // Only apply price sorting if "show free first" is not active
      filtered.sort((a, b) => {
        const aPrice = a.price || 0
        const bPrice = b.price || 0
        return priceSort === "asc" ? aPrice - bPrice : bPrice - aPrice
      })
    }

    return filtered
  }

  const handleCourseAction = (courseId: number) => {
    const isOwned = isAuthenticated && purchasedCourses.includes(courseId)

    if (isOwned) {
      router.push(`/mi-aprendizaje/${courseId}`)
    } else {
      router.push(`/cursos/${courseId}`)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-xl">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  const filteredCourses = getFilteredAndSortedCourses()

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">Todos los</h2>
          <h1 className="text-5xl md:text-6xl font-black">CURSOS</h1>
          {isAuthenticated && user && (
            <p className="text-gray-600 mt-4">¡Hola {user.name}! Aquí tienes todos nuestros cursos disponibles.</p>
          )}
          {!currencyLoading && currency.code !== "USD" && (
            <p className="text-sm text-gray-500 mt-2">
              Precios mostrados en {currency.code} • Tasa de cambio actualizada
            </p>
          )}
        </div>

        <div className="max-w-6xl mx-auto mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price Sort Filter */}
            <div className="flex flex-col">
              <label className="text-sm font-semibold text-gray-700 mb-2">Ordenar por precio</label>
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value as "asc" | "desc" | "none")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="none">Sin ordenar</option>
                <option value="asc">Menor a mayor precio</option>
                <option value="desc">Mayor a menor precio</option>
              </select>
            </div>

            {/* Free Courses First Filter */}
            <div className="flex items-end">
              <label className="flex items-center cursor-pointer gap-3 p-2 rounded-lg hover:bg-gray-200 transition">
                <input
                  type="checkbox"
                  checked={showFreeFirst}
                  onChange={(e) => setShowFreeFirst(e.target.checked)}
                  className="w-5 h-5 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-sm font-semibold text-gray-700">Mostrar cursos gratis primero</span>
              </label>
            </div>
          </div>

          {/* Active filters indicator */}
          {(priceSort !== "none" || showFreeFirst) && (
            <div className="mt-4 p-2 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <span className="font-semibold">Filtros activos:</span>{" "}
                {priceSort !== "none" &&
                  `Ordenado por precio (${priceSort === "asc" ? "menor a mayor" : "mayor a menor"})`}
                {priceSort !== "none" && showFreeFirst && " • "}
                {showFreeFirst && "Cursos gratis primero"}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredCourses.map((course) => {
            const isOwned = isAuthenticated && purchasedCourses.includes(course.id)
            return (
              <div
                key={course.id}
                className="flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-60 w-full mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={course.image || "/placeholder.svg?height=300&width=400"}
                    alt={course.title}
                    fill
                    className="object-cover rounded-t-xl"
                  />
                  {isOwned && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      ✓ ADQUIRIDO
                    </div>
                  )}
                  {course.hasVideo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-2">
                    <span className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full font-medium">
                      {course.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 flex-grow line-clamp-3">{course.description}</p>

                  <div className="mt-auto">
                    {!isOwned && !course.isFree && (
                      <>
                        <div className="flex items-center mb-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {currencyLoading ? (
                              <span className="animate-pulse bg-gray-200 rounded px-4 py-1">Cargando...</span>
                            ) : (
                              formatPrice(course.price)
                            )}
                          </span>
                          {(course.discount ?? 0) > 0 && !currencyLoading && (
                            <div className="ml-3 flex items-center">
                              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                                -{course.discount}%
                              </span>
                              {course.originalPrice && (
                                <span className="ml-2 text-gray-500 line-through text-sm">
                                  {formatPrice(course.originalPrice)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {!currencyLoading && currency.code !== "USD" && (
                          <p className="text-gray-500 text-sm mb-2">Precio original: ${course.price} USD</p>
                        )}

                        {currency.code === "BOB" && (
                          <p className="text-gray-500 text-sm mb-4">Cambio oficial del BCB aplicado</p>
                        )}
                      </>
                    )}

                    {!isOwned && course.isFree && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm font-medium">¡Este curso es completamente gratuito!</p>
                      </div>
                    )}

                    {isOwned && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800 text-sm font-medium">
                          ¡Ya tienes acceso a este curso! Continúa tu aprendizaje.
                        </p>
                      </div>
                    )}

                    <Button
                      className={`w-full font-bold flex items-center justify-center rounded-full gap-2 py-5 ${
                        isOwned
                          ? "bg-gray-500 hover:bg-gray-600 text-white"
                          : course.isFree
                            ? "bg-orange-700 hover:bg-orange-500 text-black"
                            : "bg-orange-700 hover:bg-orange-500 text-black"
                      }`}
                      onClick={() => handleCourseAction(course.id)}
                    >
                      {isOwned ? (
                        <>
                          Continuar curso <ArrowRightCircle className="h-5 w-5" />
                        </>
                      ) : course.isFree ? (
                        <>
                          Obtenlo sin costo <CheckCircle className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Comprar <ShoppingCart className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
