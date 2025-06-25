"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Truck, Package } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { CountryService } from "@/services/country-service"

interface Product {
  id: string
  name: string
  author?: string
  price: string | number
  originalPrice?: string | number
  discount?: number
  image: string
  stock: number
  category: "libro" | "revista"
  description?: string
  images?: string[]
  formats?: ("digital" | "fisico")[]
  longDescription?: string
}

interface CountryInfo {
  country: string
  countryCode: string
  currency: string
  currencySymbol: string
  exchangeRate: number
}

// Departamentos de Bolivia con información de envío
const BOLIVIA_DEPARTMENTS = [
  {
    code: "LP",
    name: "La Paz",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "EA",
    name: "El Alto",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "CBBA",
    name: "Cochabamba",
    isCapital: true,
    fedexAvailable: false,
  },
  {
    code: "SC",
    name: "Santa Cruz",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "OR",
    name: "Oruro",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "PT",
    name: "Potosí",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "TJ",
    name: "Tarija",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "CH",
    name: "Chuquisaca",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "BE",
    name: "Beni",
    isCapital: true,
    fedexAvailable: true,
  },
  {
    code: "PD",
    name: "Pando",
    isCapital: true,
    fedexAvailable: true,
  },
]

export default function ProductDetailPage({ params }: { params: { category: string; id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, user } = useAuthContext()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState<"digital" | "fisico">("fisico")
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null)

  // Estados para información de envío
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [needsHomeDelivery, setNeedsHomeDelivery] = useState(false)
  const [shippingAddress, setShippingAddress] = useState("")
  const [cochabambaDeliveryMethod, setCochabambaDeliveryMethod] = useState<"office" | "shipping">("office")

  // Obtener información del departamento seleccionado
  const selectedDeptInfo = BOLIVIA_DEPARTMENTS.find((dept) => dept.code === selectedDepartment)

  useEffect(() => {
    const detectUserCountry = async () => {
      const detectedCountry = await CountryService.detectCountry()
      setCountryInfo(detectedCountry)
    }

    detectUserCountry()
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        // Obtener el producto específico por ID
        const data = await api.get<Product>(`/product/${params.id}`)

        // Añadir datos adicionales si no vienen del backend
        const enhancedProduct = {
          ...data,
          images: data.images || [data.image, data.image, data.image, data.image],
          formats: data.formats || ["digital", "fisico"],
          longDescription:
            data.longDescription ||
            `Somos seres capaces de explorar y transformar materia, pero nuestro gran defecto es nacer en un espacio que limita nuestros sentidos y acciones. La sociedad se ocupa de colocar un sello de conformidad en nosotros, como si la ley del menor esfuerzo nos fuera desde el principio.

            Este ${params.category} te ayudará a romper esas barreras mentales y desarrollar todo tu potencial. Con ejercicios prácticos y teoría fundamentada, podrás aplicar los conceptos en tu vida diaria.

            Incluye casos de estudio reales, ejemplos prácticos y una metodología probada que ha ayudado a miles de personas a alcanzar sus objetivos.`,
        }

        setProduct(enhancedProduct)
      } catch (error) {
        console.error("Error al cargar el producto:", error)
        // Datos de ejemplo en caso de error
        setProduct({
          id: params.id,
          name: "ESCUELA FINANCIERA OPTIKIDS",
          author: "Nicolas Crossu",
          price: 20,
          originalPrice: 40,
          discount: 50,
          image: "/placeholder.svg?height=400&width=300",
          stock: 15,
          category: params.category as "libro" | "revista",
          description:
            "Somos seres capaces de explorar y transformar materia, pero nuestro gran defecto es nacer en un espacio que limita nuestros sentidos y acciones.",
          images: [
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
            "/placeholder.svg?height=400&width=300",
          ],
          formats: ["digital", "fisico"],
          longDescription: `Somos seres capaces de explorar y transformar materia, pero nuestro gran defecto es nacer en un espacio que limita nuestros sentidos y acciones. La sociedad se ocupa de colocar un sello de conformidad en nosotros, como si la ley del menor esfuerzo nos fuera desde el principio.

          Este ${params.category} te ayudará a romper esas barreras mentales y desarrollar todo tu potencial. Con ejercicios prácticos y teoría fundamentada, podrás aplicar los conceptos en tu vida diaria.

          Incluye casos de estudio reales, ejemplos prácticos y una metodología probada que ha ayudado a miles de personas a alcanzar sus objetivos.`,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id, params.category])

  // Resetear campos de envío cuando cambia el formato
  useEffect(() => {
    if (selectedFormat === "digital") {
      setSelectedDepartment("")
      setNeedsHomeDelivery(false)
      setShippingAddress("")
      setCochabambaDeliveryMethod("office")
    }
  }, [selectedFormat])

  // Resetear envío a domicilio cuando cambia el departamento
  useEffect(() => {
    setNeedsHomeDelivery(false)
    setShippingAddress("")
    if (selectedDepartment !== "CBBA") {
      setCochabambaDeliveryMethod("shipping")
    } else {
      setCochabambaDeliveryMethod("office")
    }
  }, [selectedDepartment])

  const validateShippingInfo = () => {
    if (selectedFormat === "fisico") {
      if (!selectedDepartment) {
        toast({
          title: "Información de envío requerida",
          description: "Por favor selecciona tu departamento para el envío físico.",
          variant: "destructive",
        })
        return false
      }

      // Validación especial para Cochabamba
      if (selectedDepartment === "CBBA" && cochabambaDeliveryMethod === "shipping" && needsHomeDelivery && !shippingAddress.trim()) {
        toast({
          title: "Dirección requerida",
          description: "Por favor ingresa tu dirección completa para envío a domicilio.",
          variant: "destructive",
        })
        return false
      }

      // Validación para otros departamentos
      if (selectedDepartment !== "CBBA" && needsHomeDelivery && !shippingAddress.trim()) {
        toast({
          title: "Dirección requerida",
          description: "Por favor ingresa tu dirección completa para envío.",
          variant: "destructive",
        })
        return false
      }
    }
    return true
  }

  const handleBuy = async () => {
    if (!product) return

    // Validar información de envío antes de proceder
    if (!validateShippingInfo()) {
      return
    }

    setPurchasing(true)

    try {
      // Función para convertir precio a número si es string
      const parsePrice = (price: string | number): number => {
        if (typeof price === "string") {
          return Number.parseFloat(price)
        }
        return price
      }

      const finalPrice = parsePrice(product.price)
      const originalPrice = product.originalPrice ? parsePrice(product.originalPrice) : finalPrice
      const discount = product.discount || 0

      // Limpiar localStorage de datos anteriores
      localStorage.removeItem("checkoutCourse")
      localStorage.removeItem("checkoutProduct")
      localStorage.removeItem("checkoutEvent")

      // Traducir el formato a inglés para el backend
      const deliveryType = selectedFormat === "fisico" ? "physical" : "digital"

      // Guardar información del producto en localStorage
      localStorage.setItem(
        "checkoutProduct",
        JSON.stringify({
          id: product.id,
          name: product.name,
          price: finalPrice,
          originalPrice: originalPrice,
          discount: discount,
          image: product.image,
          category: product.category,
          format: selectedFormat,
          deliveryType: selectedFormat === "digital" ? "digital" : "physical",
          department: selectedDepartment,
          departmentName: selectedDeptInfo?.name,
          needsHomeDelivery: selectedDepartment === "CBBA" ? cochabambaDeliveryMethod === "shipping" : needsHomeDelivery,
          shippingAddress,
          fedexAvailable: selectedDeptInfo?.fedexAvailable || false,
          isCapital: selectedDeptInfo?.isCapital || false,
          type: "product",
          deliveryMethod: selectedDepartment === "CBBA" ? cochabambaDeliveryMethod : null,
          // Añadir estos campos para asegurar que estén disponibles para el backend
          fullName: "", // Se llenará en el checkout
          phone: "", // Se llenará en el checkout
          country: "Bolivia", // Por defecto
        }),
      )

      if (!isAuthenticated) {
        // Si no está autenticado, guardar el producto actual y redirigir a login
        localStorage.setItem("pendingPurchaseProductId", params.id)
        const redirectUrl = `/checkout?productId=${params.id}`
        router.push(`/login?redirect=${encodeURIComponent(redirectUrl)}`)
        return
      }

      // Redirigir al checkout como en los cursos
      router.push("/checkout")
    } catch (error) {
      console.error("Error preparing checkout:", error)
      toast({
        title: "Error",
        description: "Ocurrió un problema al preparar la compra.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin"></div>
        <p className="ml-4 text-xl">Cargando producto...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto py-16 px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Producto no encontrado</h1>
          <p className="text-xl">El producto que buscas no está disponible.</p>
          <Link href={`/productos/${params.category}`} className="mt-8 inline-block">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Volver a {params.category}s</Button>
          </Link>
        </div>
      </div>
    )
  }

  // Función para convertir precio a número si es string
  const parsePrice = (price: string | number): number => {
    if (typeof price === "string") {
      return Number.parseFloat(price)
    }
    return price
  }

  const finalPrice = parsePrice(product.price)
  const originalPrice = product.originalPrice ? parsePrice(product.originalPrice) : null

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8">
          <Link
            href={`/productos/${params.category}`}
            className="text-orange-500 hover:text-orange-600 flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a {params.category}s
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
              <Image
                src={product.images?.[selectedImage] || product.image}
                alt={product.name}
                fill
                className="object-contain p-4"
              />
            </div>

            {/* Miniaturas */}
            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 bg-gray-50 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? "border-orange-500" : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} vista ${index + 1}`}
                    fill
                    className="object-contain p-1"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            {/* Categoría */}
            <div>
              <span className="text-orange-500 text-sm font-medium uppercase tracking-wide">{params.category}</span>
            </div>

            {/* Título y autor */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.author && <p className="text-gray-600">By {product.author}</p>}
            </div>

            {/* Descripción */}
            <div>
              <h3 className="font-semibold mb-2">Descripción</h3>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>

            {/* Formato */}
            {product.formats && product.formats.length > 1 && (
              <div>
                <h3 className="font-semibold mb-3">Formato</h3>
                <div className="flex space-x-4">
                  {product.formats.map((format) => (
                    <label key={format} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={selectedFormat === format}
                        onChange={(e) => setSelectedFormat(e.target.value as "digital" | "fisico")}
                        className="mr-2 text-orange-500 focus:ring-orange-500"
                      />
                      <span className="capitalize">{format}</span>
                    </label>
                  ))}
                </div>
                {/* Información adicional sobre el formato */}
                <div className="mt-2 text-sm text-gray-600">
                  {selectedFormat === "digital" ? (
                    <p>📱 Descarga inmediata después del pago</p>
                  ) : (
                    <p>📦 Envío físico solo en Bolivia</p>
                  )}
                </div>
              </div>
            )}

            {/* Información de envío - Solo para formato físico */}
            {selectedFormat === "fisico" && (
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-6 w-6 text-blue-600" />
                  <h3 className="font-semibold text-blue-900 text-lg">Información de Envío</h3>
                </div>

                {/* Selector de departamento */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento de entrega *</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                    required
                  >
                    <option value="">Selecciona tu departamento</option>
                    {BOLIVIA_DEPARTMENTS.map((dept) => (
                      <option key={dept.code} value={dept.code}>
                        {dept.name} {dept.isCapital ? "(Capital)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Información de envío según el departamento seleccionado */}
                {selectedDeptInfo && (
                  <>
                    {selectedDeptInfo.fedexAvailable ? (
                      // Para capitales (La Paz, Cochabamba, Santa Cruz) y El Alto
                      needsHomeDelivery ? (
                        // Si marca envío a domicilio en capital
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-orange-600" />
                            <span className="font-medium text-orange-800">Envío a Domicilio</span>
                          </div>
                          <p className="text-orange-700 text-sm">
                            📦 Envío a domicilio en {selectedDeptInfo.name} con <strong>costo adicional</strong>
                          </p>
                          <p className="text-orange-700 text-sm">🚚 Entrega en 1-3 días hábiles</p>
                          <p className="text-orange-700 text-sm font-medium mt-2">
                            💰 El costo se coordinará con atención al cliente una vez realizada su compra
                          </p>
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-xs text-blue-700">
                              📞 <strong>Nota:</strong> Nuestro equipo se contactará contigo después de la compra para
                              coordinar la entrega a domicilio y confirmar el costo adicional.
                            </p>
                          </div>
                        </div>
                      ) : (
                        // Envío normal a capital (gratis)
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Envío con FedEx</span>
                          </div>
                          <p className="text-green-700 text-sm">
                            ✅ <strong>Envío GRATIS</strong> a {selectedDeptInfo.name}
                          </p>
                          <p className="text-green-700 text-sm">🚚 Entrega en 1-2 días hábiles</p>
                        </div>
                      )
                    ) : (
                      // Para otros departamentos
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-5 w-5 text-orange-600" />
                          <span className="font-medium text-orange-800">Envío Interdepartamental</span>
                        </div>
                        <p className="text-orange-700 text-sm">
                          📦 Envío a {selectedDeptInfo.name} con <strong>costo adicional</strong>
                        </p>
                        <p className="text-orange-700 text-sm">🚚 Entrega en 3-5 días hábiles</p>
                        <p className="text-orange-700 text-sm font-medium mt-2">
                          💰 El costo se coordinará con atención al cliente una vez realizada su compra
                        </p>
                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <p className="text-xs text-blue-700">
                            📞 <strong>Nota:</strong> Nuestro equipo se contactará contigo después de la compra para
                            coordinar el envío y confirmar el costo adicional según tu ubicación.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Opciones especiales para Cochabamba */}
                {selectedDepartment === "CBBA" && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Método de entrega en Cochabamba</h4>
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="cochabambaDelivery"
                          value="office"
                          checked={cochabambaDeliveryMethod === "office"}
                          onChange={() => setCochabambaDeliveryMethod("office")}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        <span>Recojo en oficina (Gratis)</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="cochabambaDelivery"
                          value="shipping"
                          checked={cochabambaDeliveryMethod === "shipping"}
                          onChange={() => setCochabambaDeliveryMethod("shipping")}
                          className="mr-2 text-orange-500 focus:ring-orange-500"
                        />
                        <span>Necesito envío a domicilio o provincia</span>
                      </label>
                    </div>
                    {cochabambaDeliveryMethod === "office" && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                        <p>📍 Dirección: <a href="https://maps.app.goo.gl/zynnG3QMVnxeoZpC9" target="_blank" rel="noopener noreferrer">https://maps.app.goo.gl/zynnG3QMVnxeoZpC9</a></p>
                        <p>🕒 Horario de atención: Lunes a Viernes de 8:00 a 12:20 y de 13:30 a 17:30
                          Sábado de 8:00 a 13:00.
                        </p>
                        <p>Una ves que realice su compra comunique con el nombre que realizo su compra, el nombre del producto y el comprobante de pago</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Opción de envío a domicilio - Solo para otros departamentos o si en Cochabamba seleccionó envío */}
                {(selectedDepartment !== "CBBA" || cochabambaDeliveryMethod === "shipping") && (
                  <div className="mb-4">
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsHomeDelivery}
                        onChange={(e) => setNeedsHomeDelivery(e.target.checked)}
                        className="mr-3 mt-1 text-orange-500 focus:ring-orange-500"
                        disabled={selectedDepartment === "CBBA" && cochabambaDeliveryMethod === "office"}
                      />
                      <div>
                        <span className="text-sm font-medium">
                          {selectedDepartment === "CBBA" 
                            ? "Envío a domicilio o provincia" 
                            : "Envío a provincia"}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {selectedDepartment === "CBBA"
                            ? "Marca esta opción si necesitas envío a una dirección específica en Cochabamba o provincia"
                            : `Marca esta opción si necesitas envío a una dirección específica en ${selectedDeptInfo?.name}`}
                        </p>
                      </div>
                    </label>
                  </div>
                )}

                {/* Campo de dirección para envío a domicilio */}
                {needsHomeDelivery && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección completa de entrega *
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Ingresa tu dirección completa: zona/barrio, calle, número, referencias..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      rows={4}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Incluye todos los detalles: zona/barrio, calle, número de casa y referencias para facilitar la entrega
                    </p>
                    {!selectedDeptInfo?.fedexAvailable && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        ⚠️ <strong>Nota:</strong> El costo de envío a domicilio se coordinará con atención al cliente
                        según la ubicación específica
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Precio */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl font-bold">${finalPrice.toFixed(2)}</span>
                <span className="text-sm text-gray-600">USD</span>
                {product.discount && originalPrice && (
                  <>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                      {product.discount}% Dto.
                    </span>
                    <span className="text-gray-500 line-through">${originalPrice.toFixed(2)}USD</span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">Bolivia cambio oficial: 6.96 bs</p>

              {/* Información adicional de costos de envío */}
              {selectedFormat === "fisico" &&
                selectedDeptInfo &&
                (needsHomeDelivery || !selectedDeptInfo.fedexAvailable) && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                    <p className="text-xs text-orange-700">
                      * El precio no incluye costo de envío - se coordinará con atención al cliente una vez realizada la
                      compra
                    </p>
                  </div>
                )}
            </div>

            {/* Botón de compra */}
            <Button
              onClick={handleBuy}
              disabled={purchasing || (selectedFormat === "fisico" && !selectedDepartment)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-6 text-lg disabled:opacity-50"
            >
              {purchasing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Procesando...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Comprar {selectedFormat === "digital" ? "Digital" : "Físico"}
                </>
              )}
            </Button>

            {/* Información adicional */}
            <div className="text-sm text-gray-600 text-center">
              {selectedFormat === "fisico" && !selectedDepartment && (
                <p className="text-orange-600">⚠️ Selecciona tu departamento para continuar</p>
              )}
              {selectedFormat === "fisico" && selectedDepartment && selectedDepartment === "CBBA" && cochabambaDeliveryMethod === "shipping" && needsHomeDelivery && !shippingAddress.trim() && (
                <p className="text-orange-600">⚠️ Ingresa tu dirección completa para envío a domicilio</p>
              )}
              {selectedFormat === "fisico" && selectedDepartment && selectedDepartment !== "CBBA" && needsHomeDelivery && !shippingAddress.trim() && (
                <p className="text-orange-600">⚠️ Ingresa tu dirección completa para envío a domicilio</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}