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
  isFree?: boolean // Added isFree property to Course interface
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch cursos disponibles (tu lógica original)
        const data = await api.get<Course[]>("/courses")
        setCourses(data)
        console.log("📚 Cursos obtenidos:", data)

        // Fetch cursos comprados por el usuario si está autenticado
        if (isAuthenticated && user?.id) {
          try {
            console.log(`🔍 Haciendo fetch a: /sales/user/${user.id}/courses`)
            const purchasedData = await api.get<PurchasedCourse[]>(`/sales/user/${user.id}/courses`)
            console.log("🛒 Respuesta de cursos comprados:", purchasedData)

            // Solo considerar cursos con status "paid"
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
        // Tu fallback original
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

    // Solo hacer fetch cuando la autenticación haya terminado de cargar
    if (!authLoading) {
      fetchData()
    }
  }, [authLoading])

  const handleCourseAction = (courseId: number) => {
    const isOwned = isAuthenticated && purchasedCourses.includes(courseId)

    if (isOwned) {
      // Si ya compró el curso, ir a mi-aprendizaje
      router.push(`/mi-aprendizaje/${courseId}`)
    } else {
      // Si no lo compró, ir a la página de compra (tu lógica original)
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {courses.map((course) => {
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

                        {/* Mostrar precio en USD como referencia si no es USD */}
                        {!currencyLoading && currency.code !== "USD" && (
                          <p className="text-gray-500 text-sm mb-2">Precio original: ${course.price} USD</p>
                        )}

                        {/* Información específica para Bolivia */}
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
                          Gratis <CheckCircle className="h-4 w-4" />
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

        {/* Sección Premium */}
        <div className="mt-16 max-w-6xl mx-auto rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-700 via-black to-orange-700 p-10 text-white text-center">
            <h2 className="text-3xl font-extrabold mb-2">CONVIÉRTETE EN</h2>
            <h3 className="text-3xl font-extrabold mb-6">PREMIUM</h3>
            <p className="mb-8 max-w-md mx-auto font-light">Accede a todos los cursos y recursos y asistente de IA</p>
            <Button
              className="bg-orange-700 hover:bg-orange-600 rounded-full font-black text-black px-8 py-6 transition-all duration-200"
              onClick={() => {
                if (!isAuthenticated) {
                  router.push("/login")
                } else {
                  router.push("/premium")
                }
              }}
            >
              {isAuthenticated ? "Sí quiero ser optimizado" : "Iniciar sesión para Premium"}
            </Button>
          </div>
        </div>

        {/* Mensaje para usuarios no autenticados */}
        {!isAuthenticated && (
          <div className="mt-12 max-w-2xl mx-auto text-center p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-xl font-bold text-blue-900 mb-2">¿Ya tienes una cuenta?</h3>
            <p className="text-blue-700 mb-4">
              Inicia sesión para ver tus cursos comprados y continuar tu aprendizaje.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2"
            >
              Iniciar Sesión
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
