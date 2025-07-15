"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ShoppingCart, Truck, Package, X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { useCurrency } from "@/hooks/use-currency"

interface Product {
  id: string
  name: string
  author?: string
  price: string | number // Precio para formato digital
  physicalPrice?: string | number // <--- AÑADIDO: Precio para formato físico
  originalPrice?: string | number // Precio original para digital, si hay descuento
  discount?: number // Porcentaje de descuento para digital
  image: string
  extraImageUrl?: string
  extraImageUrlDos?: string
  gifUrl?: string
  trailerUrl?: string
  stock: number
  category: "libro" | "revista"
  description?: string
  images?: string[]
  formats?: ("digital" | "fisico")[]
  longDescription?: string
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
  const { formatPrice, currency, isLoading: currencyLoading } = useCurrency()

  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedFormat, setSelectedFormat] = useState<"digital" | "fisico">("fisico") // Default to physical as per original code
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Nuevo estado para controlar qué imagen se muestra en el área principal
  const [mainImageIndex, setMainImageIndex] = useState(0)

  // Estados para información de envío
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [needsHomeDelivery, setNeedsHomeDelivery] = useState(false)
  const [shippingAddress, setShippingAddress] = useState("")
  const [cochabambaDeliveryMethod, setCochabambaDeliveryMethod] = useState<"office" | "shipping">("office")

  // Obtener información del departamento seleccionado
  const selectedDeptInfo = BOLIVIA_DEPARTMENTS.find((dept) => dept.code === selectedDepartment)

  // Función para obtener URL de embed de Vimeo
  const getEmbedUrl = (url: string) => {
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`
    }
    if (url.includes("youtube.com/watch")) {
      const videoId = url.split("v=")[1]?.split("&")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`
    }
    if (url.includes("youtu.be/")) {
      const videoId = url.split("/").pop()?.split("?")[0]
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1`
    }
    return url
  }

  // Crear array de imágenes para la galería
  const getGalleryImages = () => {
    if (!product) return []
    const images = []
    // Imagen principal (GIF)
    images.push({
      src: product.gifUrl || product.image,
      alt: product.name,
      type: "image",
    })
    // Primera imagen extra
    if (product.extraImageUrl) {
      images.push({
        src: product.extraImageUrl,
        alt: `${product.name} imagen 1`,
        type: "image",
      })
    }
    // Segunda imagen extra
    if (product.extraImageUrlDos) {
      images.push({
        src: product.extraImageUrlDos,
        alt: `${product.name} imagen 2`,
        type: "image",
      })
    }
    // Video trailer - AGREGAR AQUÍ
    if (product.trailerUrl) {
      images.push({
        src: product.trailerUrl,
        alt: `Video trailer de ${product.name}`,
        type: "video",
      })
    }
    return images
  }

  // Crear array de slides para el carrusel móvil
  const getCarouselSlides = () => {
    if (!product) return []
    const slides = []
    // Slide 1: GIF principal
    slides.push({
      type: "image",
      src: product.gifUrl || product.image,
      alt: product.name,
      isMain: true,
    })
    // Slide 2: Primera imagen extra
    if (product.extraImageUrl) {
      slides.push({
        type: "image",
        src: product.extraImageUrl,
        alt: `${product.name} imagen 1`,
        isMain: false,
      })
    }
    // Slide 3: Segunda imagen extra
    if (product.extraImageUrlDos) {
      slides.push({
        type: "image",
        src: product.extraImageUrlDos,
        alt: `${product.name} imagen 2`,
        isMain: false,
      })
    }
    // Slide 4: Video trailer
    if (product.trailerUrl) {
      slides.push({
        type: "video",
        src: product.trailerUrl,
        alt: `Video trailer de ${product.name}`,
        isMain: false,
      })
    }
    return slides
  }

  const galleryImages = getGalleryImages()
  const slides = getCarouselSlides()

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const handleVideoClick = () => {
    if (slides[currentSlide]?.type === "video") {
      setShowVideoModal(true)
    }
  }

  // Función para manejar el click en las miniaturas
  const handleThumbnailClick = (index: number) => {
    setMainImageIndex(index)
  }

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
          price: 20, // Precio digital de ejemplo
          physicalPrice: 30, // Precio físico de ejemplo
          originalPrice: 40, // Precio original digital de ejemplo
          discount: 50, // Descuento digital de ejemplo
          image: "/placeholder.svg?height=400&width=300",
          extraImageUrl: "/placeholder.svg?height=400&width=300",
          extraImageUrlDos: "/placeholder.svg?height=400&width=300",
          gifUrl: "/placeholder.svg?height=400&width=300",
          trailerUrl: "https://vimeo.com/123456789",
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
      if (
        selectedDepartment === "CBBA" &&
        cochabambaDeliveryMethod === "shipping" &&
        needsHomeDelivery &&
        !shippingAddress.trim()
      ) {
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

      // Determinar el precio final y el precio original para el checkout
      const currentPriceValue =
        selectedFormat === "fisico" && product.physicalPrice ? product.physicalPrice : product.price
      const finalPriceForCheckout = parsePrice(currentPriceValue)

      // El originalPrice y discount en el producto se asumen para la versión digital.
      // Si el formato es físico, el originalPrice para el checkout será el physicalPrice si no hay un original específico para físico.
      const originalPriceForCheckout =
        selectedFormat === "fisico" && product.physicalPrice
          ? parsePrice(product.physicalPrice) // Si es físico, su "original" es su propio precio si no hay otro definido
          : product.originalPrice
            ? parsePrice(product.originalPrice)
            : finalPriceForCheckout

      const discountForCheckout = selectedFormat === "digital" ? product.discount || 0 : 0

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
          price: finalPriceForCheckout, // Usar el precio determinado por el formato
          originalPrice: originalPriceForCheckout, // Usar el precio original determinado por el formato
          discount: discountForCheckout, // Usar el descuento determinado por el formato
          image: product.image,
          category: product.category,
          format: selectedFormat,
          deliveryType: deliveryType,
          department: selectedDepartment,
          departmentName: selectedDeptInfo?.name,
          needsHomeDelivery:
            selectedDepartment === "CBBA" ? cochabambaDeliveryMethod === "shipping" : needsHomeDelivery,
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

  // Lógica para determinar el precio a mostrar en la UI
  const currentDisplayPrice =
    selectedFormat === "fisico" && product.physicalPrice ? product.physicalPrice : product.price

  const finalPrice = parsePrice(currentDisplayPrice)

  // Lógica para determinar el precio original y el descuento a mostrar en la UI
  let displayOriginalPrice: number | null = null
  let displayDiscount: number | null = null

  if (selectedFormat === "digital" && product.originalPrice && product.discount) {
    displayOriginalPrice = parsePrice(product.originalPrice)
    displayDiscount = product.discount
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-4 md:py-8 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-4 md:mb-8">
          <Link
            href={`/productos/${params.category}`}
            className="text-orange-500 hover:text-orange-600 flex items-center text-sm md:text-base"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a {params.category}s
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Vista Desktop - Layout mejorado con funcionalidad clickeable */}
            <div className="hidden md:block">
              {/* Imagen principal - Muestra la imagen/video seleccionado */}
              <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden mb-4">
                {galleryImages[mainImageIndex]?.type === "video" ? (
                  // Mostrar preview del video en el área principal
                  <div
                    className="relative w-full h-full bg-gray-900 cursor-pointer"
                    onClick={() => setShowVideoModal(true)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[18px] border-l-white border-b-[12px] border-b-transparent ml-1"></div>
                      </div>
                    </div>
                    <span className="absolute bottom-4 left-4 text-white text-lg font-medium">Video Trailer</span>
                    <span className="absolute top-4 right-4 text-white text-sm bg-black/30 px-2 py-1 rounded">
                      Click para reproducir
                    </span>
                  </div>
                ) : (
                  // Mostrar imagen normal
                  <Image
                    src={galleryImages[mainImageIndex]?.src || product.image}
                    alt={galleryImages[mainImageIndex]?.alt || product.name}
                    fill
                    className="object-contain p-4"
                  />
                )}
              </div>
              {/* Miniaturas - Solo mostrar las que NO están seleccionadas actualmente */}
              <div className="grid grid-cols-3 gap-2">
                {galleryImages.map((item, index) => {
                  // No mostrar la miniatura si es la que está seleccionada actualmente
                  if (index === mainImageIndex) return null
                  return (
                    <div
                      key={index}
                      className="relative h-20 bg-gray-50 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 cursor-pointer transition-all"
                      onClick={() => {
                        // Si es video, abrir modal directamente
                        if (item.type === "video") {
                          setShowVideoModal(true)
                        } else {
                          // Si es imagen, cambiar a área principal
                          handleThumbnailClick(index)
                        }
                      }}
                    >
                      {item.type === "video" ? (
                        // Miniatura de video
                        <div className="relative w-full h-full bg-gray-900">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                            </div>
                          </div>
                          <span className="absolute bottom-1 left-1 text-white text-xs font-medium">Video</span>
                        </div>
                      ) : (
                        // Miniatura de imagen
                        <Image
                          src={item.src || "/placeholder.svg"}
                          alt={item.alt}
                          fill
                          className="object-contain p-1"
                        />
                      )}
                    </div>
                  )
                })}
                {/* Rellenar espacios vacíos si hay menos de 3 elementos para mostrar */}
                {Array.from({ length: Math.max(0, 3 - (galleryImages.length - 1)) }).map((_, emptyIndex) => (
                  <div key={`empty-${emptyIndex}`} className="h-20 bg-gray-100 rounded-lg opacity-50"></div>
                ))}
              </div>
            </div>
            {/* Vista Mobile - Carrusel (sin cambios) */}
            <div className="md:hidden">
              <div className="relative">
                {/* Carrusel principal */}
                <div className="relative h-80 bg-gray-50 rounded-lg overflow-hidden">
                  {slides.length > 0 && (
                    <>
                      {slides[currentSlide].type === "image" ? (
                        <Image
                          src={slides[currentSlide].src || "/placeholder.svg"}
                          alt={slides[currentSlide].alt}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <div className="relative w-full h-full bg-gray-900 cursor-pointer" onClick={handleVideoClick}>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                              <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                          <span className="absolute bottom-4 left-4 text-white text-sm font-medium">Video Trailer</span>
                        </div>
                      )}
                    </>
                  )}
                  {/* Botones de navegación */}
                  {slides.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextSlide}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
                {/* Indicadores de puntos */}
                {slides.length > 1 && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide ? "bg-orange-500" : "bg-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Información del producto */}
          <div className="space-y-4 md:space-y-6">
            {/* Categoría */}
            <div>
              <span className="text-orange-500 text-sm font-medium uppercase tracking-wide">{params.category}</span>
            </div>
            {/* Título y autor */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
              {product.author && <p className="text-gray-600 text-sm md:text-base">By {product.author}</p>}
            </div>
            {/* Descripción */}
            <div>
              <h3 className="font-semibold mb-2 text-sm md:text-base">Descripción</h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">{product.description}</p>
            </div>
            {/* Formato */}
            {product.formats && product.formats.length > 1 && (
              <div>
                <h3 className="font-semibold mb-3 text-sm md:text-base">Formato</h3>
                <div className="flex justify-center space-x-6 md:space-x-8">
                  {product.formats.map((format) => (
                    <label key={format} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="format"
                        value={format}
                        checked={selectedFormat === format}
                        onChange={(e) => setSelectedFormat(e.target.value as "digital" | "fisico")}
                        className="mr-2 text-orange-500 focus:ring-orange-500 "
                      />
                      <span className="capitalize text-sm md:text-base">{format}</span>
                    </label>
                  ))}
                </div>
                {/* Información adicional sobre el formato */}
                <div className="mt-2 text-xs md:text-sm text-black text-center">
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
              <div className="bg-white p-4 md:p-6 rounded-lg ">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="h-5 w-5 md:h-6 md:w-6 text-orange-700" />
                  <h3 className="font-semibold text-orange-700 text-base md:text-lg">Información de Envío</h3>
                </div>
                {/* Selector de departamento */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Departamento de entrega *</label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full p-2 md:p-3 text-sm md:text-base border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
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
                        <div className="bg-orange-50 p-3 md:p-4 rounded-lg border border-orange-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                            <span className="font-medium text-orange-800 text-sm md:text-base">Envío a Domicilio</span>
                          </div>
                          <p className="text-orange-700 text-xs md:text-sm">
                            📦 Envío a domicilio en {selectedDeptInfo.name} con <strong>costo adicional</strong>
                          </p>
                          <p className="text-orange-700 text-xs md:text-sm">🚚 Entrega en 1-3 días hábiles</p>
                          <p className="text-orange-700 text-xs md:text-sm font-medium mt-2">
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
                        <div className="bg-green-50 p-3 md:p-4 rounded-lg border border-green-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                            <span className="font-medium text-green-800 text-sm md:text-base">Envío con FedEx</span>
                          </div>
                          <p className="text-green-700 text-xs md:text-sm">
                            ✅ <strong>Envío GRATIS</strong> a {selectedDeptInfo.name}
                          </p>
                          <p className="text-green-700 text-xs md:text-sm">🚚 Entrega en 1-2 días hábiles</p>
                        </div>
                      )
                    ) : (
                      // Para otros departamentos
                      <div className="bg-orange-50 p-3 md:p-4 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                          <span className="font-medium text-orange-800 text-sm md:text-base">
                            Envío Interdepartamental
                          </span>
                        </div>
                        <p className="text-orange-700 text-xs md:text-sm">
                          📦 Envío a {selectedDeptInfo.name} con <strong>costo adicional</strong>
                        </p>
                        <p className="text-orange-700 text-xs md:text-sm">🚚 Entrega en 3-5 días hábiles</p>
                        <p className="text-orange-700 text-xs md:text-sm font-medium mt-2">
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
                    <h4 className="text-xs md:text-sm font-medium mb-2">Método de entrega en Cochabamba</h4>
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
                        <span className="text-xs md:text-sm">Recojo en oficina (Gratis)</span>
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
                        <span className="text-xs md:text-sm">Necesito envío a domicilio o provincia</span>
                      </label>
                    </div>
                    {cochabambaDeliveryMethod === "office" && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                        <p>
                          📍 Dirección:{" "}
                          <a href="https://maps.app.goo.gl/zynnG3QMVnxeoZpC9" target="_blank" rel="noopener noreferrer">
                            https://maps.app.goo.gl/zynnG3QMVnxeoZpC9
                          </a>
                        </p>
                        <p>
                          🕒 Horario de atención: Lunes a Viernes de 8:00 a 12:30 y de 13:30 a 17:30 Sábado de 8:00 a
                          13:00.
                        </p>
                        <p>
                          Una ves que realice su compra comunique con el nombre que realizo su compra, el nombre del
                          producto y el comprobante de pago
                        </p>
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
                        <span className="text-xs md:text-sm font-medium">
                          {selectedDepartment === "CBBA" ? "Envío a domicilio o provincia" : "Envío a provincia"}
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
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                      Dirección completa de entrega *
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Ingresa tu dirección completa: zona/barrio, calle, número, referencias..."
                      className="w-full p-2 md:p-3 text-xs md:text-sm border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Incluye todos los detalles: zona/barrio, calle, número de casa y referencias para facilitar la
                      entrega
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
            {/* Precio con funcionalidad completa de moneda */}
            <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
              <div className="flex items-center space-x-2 md:space-x-3 mb-2">
                <span className="text-2xl md:text-3xl font-bold">
                  {currencyLoading ? (
                    <span className="animate-pulse bg-gray-200 rounded px-4 py-1">Cargando...</span>
                  ) : (
                    formatPrice(finalPrice)
                  )}
                </span>
                {displayDiscount && displayOriginalPrice && !currencyLoading && (
                  <>
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium">
                      {displayDiscount}% Dto.
                    </span>
                    <span className="text-gray-500 line-through text-sm">{formatPrice(displayOriginalPrice)}</span>
                  </>
                )}
              </div>
              {/* Mostrar ahorros si hay descuento y es digital */}
              {displayDiscount && displayOriginalPrice && !currencyLoading && (
                <div className="text-green-600 text-sm font-medium mb-2">
                  Ahorras: {formatPrice(displayOriginalPrice - finalPrice)}
                </div>
              )}
              {/* Mostrar precio en USD como referencia si no es USD */}
              {!currencyLoading && currency.code !== "USD" && (
                <div className="text-gray-600 text-xs md:text-sm mt-2 p-2 bg-white rounded">
                  <span className="text-xs text-gray-500">Precio original:</span>
                  <br />
                  {displayDiscount && displayOriginalPrice ? (
                    <>
                      <span className="line-through text-gray-400">${displayOriginalPrice.toFixed(2)} USD</span>
                      <span className="ml-2 font-medium">${finalPrice.toFixed(2)} USD</span>
                    </>
                  ) : (
                    <span className="font-medium">${finalPrice.toFixed(2)} USD</span>
                  )}
                </div>
              )}
              {/* Información específica para Bolivia */}
              {currency.code === "BOB" && (
                <div className="text-gray-500 text-xs mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  🇧🇴 Cambio oficial del BCB aplicado
                </div>
              )}
              {/* Indicador de moneda */}
              {!currencyLoading && currency.code !== "USD" && (
                <div className="text-xs text-gray-500 mt-2 text-center">
                  Precios mostrados en {currency.code} • Tasa actualizada
                </div>
              )}
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
              disabled={purchasing || currencyLoading || (selectedFormat === "fisico" && !selectedDepartment)}
              className="rounded-full w-full bg-orange-500 hover:bg-orange-600 text-white py-4 md:py-6 text-base md:text-lg disabled:opacity-50"
            >
              {purchasing ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Procesando...
                </>
              ) : currencyLoading ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Cargando precio...
                </>
              ) : (
                <>
                  <ShoppingCart className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Comprar {selectedFormat === "digital" ? "Digital" : "Físico"}
                </>
              )}
            </Button>
            {/* Información adicional */}
            <div className="text-xs md:text-sm text-gray-600 text-center">
              {selectedFormat === "fisico" && !selectedDepartment && (
                <p className="text-orange-600">⚠️ Selecciona tu departamento para continuar</p>
              )}
              {selectedFormat === "fisico" &&
                selectedDepartment &&
                selectedDepartment === "CBBA" &&
                cochabambaDeliveryMethod === "shipping" &&
                needsHomeDelivery &&
                !shippingAddress.trim() && (
                  <p className="text-orange-600">⚠️ Ingresa tu dirección completa para envío a domicilio</p>
                )}
              {selectedFormat === "fisico" &&
                selectedDepartment &&
                selectedDepartment !== "CBBA" &&
                needsHomeDelivery &&
                !shippingAddress.trim() && (
                  <p className="text-orange-600">⚠️ Ingresa tu dirección completa para envío a domicilio</p>
                )}
            </div>
          </div>
        </div>
      </div>
      {/* Modal de Video */}
      {showVideoModal && product.trailerUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden">
            <button
              onClick={() => setShowVideoModal(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full flex items-center justify-center text-white transition-all"
            >
              <X className="w-6 h-6" />
            </button>
            <iframe
              src={getEmbedUrl(product.trailerUrl)}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={`Trailer de ${product.name}`}
            />
          </div>
        </div>
      )}
    </div>
  )
}
