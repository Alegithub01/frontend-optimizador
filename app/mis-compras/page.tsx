"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/context/AuthContext"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, Truck, Monitor } from "lucide-react"
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

interface Product {
  id: string
  name: string
  author?: string
  price: string
  image: string
  category: string
  subCategory?: string
  description?: string
}

interface Event {
  id: string
  title: string
  description: string
  dateTime: string
  location: string
  image: string
  price: string
}

interface Purchase {
  id: number
  course: Course | null
  product: Product | null
  event: Event | null
  amount: string
  type: "course" | "product" | "event"
  deliveryType: "digital" | "physical"
  stripePaymentIntentId: string
  status: "pending" | "paid" | "failed"
  createdAt: string
}

type FilterType = "all" | "courses" | "products" | "events"
type ProductSubcategory = "all" | "libro" | "revista" | "toolkit"

export default function MisComprasPage() {
  const { user, isAuthenticated } = useAuthContext()
  const [courses, setCourses] = useState<Course[]>([])
  const [productPurchases, setProductPurchases] = useState<Purchase[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeFilter, setActiveFilter] = useState<FilterType>("all")
  const [productSubcategory, setProductSubcategory] = useState<ProductSubcategory>("all")

  useEffect(() => {
    const fetchUserPurchases = async () => {
      if (!isAuthenticated || !user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError("")

        console.log("🛒 Obteniendo compras del usuario...")

        // Obtener cursos comprados
        try {
          const userCourses = await api.get<any[]>(`/sales/user/${user.id}/courses`)
          const coursesData = userCourses
            .filter((purchase) => purchase.status === "paid" && purchase.course !== null)
            .map((purchase) => purchase.course)
          setCourses(coursesData)
          console.log("📚 Cursos obtenidos:", coursesData)
        } catch (error) {
          console.error("Error fetching courses:", error)
          setCourses([])
        }

        // Obtener productos comprados - MANTENER TODAS LAS COMPRAS INDIVIDUALES
        try {
          const userProducts = await api.get<Purchase[]>(`/sales/user/${user.id}/products`)
          const validProductPurchases = userProducts.filter(
            (purchase) => purchase.status === "paid" && purchase.product !== null
          )
          
          setProductPurchases(validProductPurchases)
          console.log("📦 Compras de productos (individuales):", validProductPurchases)
        } catch (error) {
          console.error("Error fetching products:", error)
          setProductPurchases([])
        }

        // Obtener eventos comprados
        try {
          const userEvents = await api.get<any[]>(`/sales/user/${user.id}/events`)
          const eventsData = userEvents
            .filter((purchase) => purchase.status === "paid" && purchase.event !== null)
            .map((purchase) => purchase.event)
          setEvents(eventsData)
          console.log("🎫 Eventos obtenidos:", eventsData)
        } catch (error) {
          console.error("Error fetching events:", error)
          setEvents([])
        }
      } catch (error: any) {
        console.error("❌ Error fetching user purchases:", error)
        setError("Error al cargar tus compras")
      } finally {
        setLoading(false)
      }
    }

    fetchUserPurchases()
  }, [isAuthenticated, user])

  // Filtrar compras de productos por subcategoría
  const getFilteredProductPurchases = () => {
    if (productSubcategory === "all") {
      return productPurchases
    }
    return productPurchases.filter((purchase) => {
      const category = purchase.product?.category?.toLowerCase()
      if (productSubcategory === "libro") return category === "libro"
      if (productSubcategory === "revista") return category === "revista"
      if (productSubcategory === "toolkit") return category === "toolkit"
      return true
    })
  }

  // Determinar si una compra debe mostrar botón "Continuar"
  const shouldShowContinueButton = (purchase: Purchase): boolean => {
    if (!purchase.product) return false
    
    const category = purchase.product.category?.toLowerCase()
    const deliveryType = purchase.deliveryType
    
    console.log(`🔍 Producto: ${purchase.product.name}, Categoría: ${category}, DeliveryType: ${deliveryType}`)
    
    // Para toolkits: siempre digital (siempre botón)
    if (category === "toolkit") {
      return true
    }
    
    // Para libros y revistas: solo si deliveryType es "digital"
    if (category === "libro" || category === "revista") {
      return deliveryType === "digital"
    }
    
    // Para otros productos: solo si deliveryType es "digital"
    return deliveryType === "digital"
  }

  const getProductTypeLabel = (purchase: Purchase) => {
    if (!purchase.product) return "Producto:"
    
    const category = purchase.product.category?.toLowerCase()
    const deliveryType = purchase.deliveryType
    
    if (category === "libro") {
      return deliveryType === "digital" ? "Libro digital:" : "Libro físico:"
    }
    if (category === "revista") {
      return deliveryType === "digital" ? "Revista digital:" : "Revista física:"
    }
    if (category === "toolkit") return "Toolkit:"
    return "Producto:"
  }

  const getDeliveryBadge = (deliveryType: "digital" | "physical") => {
    if (deliveryType === "digital") {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Monitor className="h-3 w-3 mr-1" />
          Digital
        </div>
      )
    } else {
      return (
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Truck className="h-3 w-3 mr-1" />
          Físico
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando tus compras...</p>
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

  const totalItems = courses.length + productPurchases.length + events.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con perfil de usuario */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            {/* Avatar del usuario */}
            <div className="w-20 h-20 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-600">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{user?.name || "Usuario"}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeFilter === "all"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Todos ({totalItems})
            </button>
            <button
              onClick={() => setActiveFilter("courses")}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeFilter === "courses"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Cursos ({courses.length})
            </button>
            <button
              onClick={() => setActiveFilter("products")}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeFilter === "products"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Productos ({productPurchases.length})
            </button>
            <button
              onClick={() => setActiveFilter("events")}
              className={`px-6 py-2 rounded-full transition-colors ${
                activeFilter === "events"
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              Eventos ({events.length})
            </button>
          </div>

          {/* Subfiltros para productos */}
          {activeFilter === "products" && (
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              <button
                onClick={() => setProductSubcategory("all")}
                className={`px-4 py-1 text-sm rounded-full transition-colors ${
                  productSubcategory === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setProductSubcategory("libro")}
                className={`px-4 py-1 text-sm rounded-full transition-colors ${
                  productSubcategory === "libro"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Libros
              </button>
              <button
                onClick={() => setProductSubcategory("revista")}
                className={`px-4 py-1 text-sm rounded-full transition-colors ${
                  productSubcategory === "revista"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Revistas
              </button>
              <button
                onClick={() => setProductSubcategory("toolkit")}
                className={`px-4 py-1 text-sm rounded-full transition-colors ${
                  productSubcategory === "toolkit"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Toolkits
              </button>
            </div>
          )}
        </div>

        {/* Contenido principal */}
        {totalItems === 0 ? (
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes compras aún</h3>
            <p className="text-gray-600 mb-6">Cuando realices tu primera compra, aparecerá aquí</p>
            <Link
              href="/cursos"
              className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Explorar cursos
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Sección de Cursos */}
            {(activeFilter === "all" || activeFilter === "courses") && courses.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis cursos comprados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <div key={course.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="relative h-48">
                        <Image
                          src={course.image || "/placeholder.svg?height=200&width=300"}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-600 mb-1">Curso:</div>
                        <h3 className="font-bold text-lg mb-4 line-clamp-2">{course.title}</h3>
                        <Link href={`/mi-aprendizaje/${course.id}`}>
                          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black rounded-full">Continuar →</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sección de Productos */}
            {(activeFilter === "all" || activeFilter === "products") && productPurchases.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis productos comprados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getFilteredProductPurchases().map((purchase) => {
                    if (!purchase.product) return null
                    
                    const showContinueButton = shouldShowContinueButton(purchase)
                    
                    return (
                      <div key={`${purchase.product.id}-${purchase.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm">
                        <div className="relative h-48 bg-gray-50 flex items-center justify-center">
                          <Image
                            src={purchase.product.image || "/placeholder.svg?height=200&width=150"}
                            alt={purchase.product.name}
                            width={120}
                            height={160}
                            className="object-contain"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm text-gray-600">{getProductTypeLabel(purchase)}</div>
                            {getDeliveryBadge(purchase.deliveryType)}
                          </div>
                          <h3 className="font-bold text-lg mb-4 line-clamp-2">{purchase.product.name}</h3>
                          
                          {showContinueButton ? (
                            <Link href={`/mis-compras/productos/${purchase.product.category}/${purchase.product.id}`}>
                              <Button className="w-full rounded-full bg-orange-500 hover:bg-orange-600 text-black">
                                Continuar →
                              </Button>
                            </Link>
                          ) : (
                            <div className="space-y-2">
                              <div className="w-full bg-gray-100 text-gray-500 py-2 px-4 rounded-lg text-center text-sm">
                                <div className="flex items-center justify-center gap-2">
                                  <Truck className="h-4 w-4" />
                                  Producto físico
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 text-center">
                                Este producto será enviado a tu dirección
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Sección de Eventos */}
            {(activeFilter === "all" || activeFilter === "events") && events.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Mis eventos participados</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                      <div className="relative h-48">
                        <Image
                          src={event.image || "/placeholder.svg?height=200&width=300"}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <div className="text-sm text-gray-600 mb-1">Evento:</div>
                        <h3 className="font-bold text-lg mb-4 line-clamp-2">{event.title}</h3>
                        <Link href={`/eventos/${event.id}`}>
                          <Button className="w-full bg-orange-500 rounded-full hover:bg-orange-600 text-black">Continuar →</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}