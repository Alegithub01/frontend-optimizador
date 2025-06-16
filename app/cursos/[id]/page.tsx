"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ShoppingCart, ChevronDown, Play, FileText, Lock, Volume2, VolumeX } from "lucide-react"
import { api } from "@/lib/api"
import { useAuthContext } from "@/context/AuthContext"
import { CountryService } from "@/services/country-service"
import { VideoService } from "@/services/video-service"

// Interfaces that coincide with the structure of your backend
interface Content {
  id: number
  title: string
  type: string // 'video', 'text', etc.
  urlOrText: string
}

interface Section {
  id: number
  title: string
  contents: Content[]
}

interface Course {
  id: number
  title: string
  description: string
  price: string
  discount: string
  image: string
  trailer: string // URL del trailer (video o imagen)
  sections: Section[]
}

interface CountryInfo {
  country: string
  countryCode: string
  currency: string
  currencySymbol: string
  exchangeRate: number
}

interface CoursePageProps {
  params: Promise<{
    id: string
  }>
}

// Helper functions for price calculations
const calculateDiscountedPrice = (price: string, discount: string) => {
  const originalPrice = Number.parseFloat(price)
  const discountAmount = Number.parseFloat(discount)

  if (discountAmount > 0) {
    const savings = originalPrice * (discountAmount / 100)
    const finalPrice = originalPrice - savings
    return {
      originalPrice,
      finalPrice,
      savings,
      discountPercentage: discountAmount,
    }
  }

  return {
    originalPrice,
    finalPrice: originalPrice,
    savings: 0,
    discountPercentage: 0,
  }
}

const convertToLocalCurrency = (priceUSD: number, countryInfo: CountryInfo | null) => {
  if (!countryInfo) return null

  return {
    price: priceUSD * countryInfo.exchangeRate,
    currency: countryInfo.currency,
    symbol: countryInfo.currencySymbol,
  }
}

export default function CoursePage({ params }: CoursePageProps) {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthContext()
  const [course, setCourse] = useState<Course | null>(null)
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState<number | null>(null)
  const [isTrailerVideo, setIsTrailerVideo] = useState(false)
  const [countryInfo, setCountryInfo] = useState<CountryInfo | null>(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [courseId, setCourseId] = useState<string>("")
  const [purchasing, setPurchasing] = useState(false)

  // Video player states
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Unwrap params using React.use()
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params
      setCourseId(resolvedParams.id)
    }
    unwrapParams()
  }, [params])

  useEffect(() => {
    const detectUserCountry = async () => {
      const detectedCountry = await CountryService.detectCountry()
      setCountryInfo(detectedCountry)
    }

    detectUserCountry()
  }, [])

  useEffect(() => {
    if (!courseId) return

    const fetchCourseData = async () => {
      try {
        setLoading(true)
        // Get specific course by ID
        const courseData = await api.get<Course>(`/courses/${courseId}`)
        setCourse(courseData)

        // Determine if the trailer is a video or an image
        if (courseData.trailer) {
          setIsTrailerVideo(VideoService.isVideoUrl(courseData.trailer))
        }

        // Get all courses for related courses section
        const allCourses = await api.get<Course[]>("/courses")
        // Filter out the current course and limit to 3 courses
        const filtered = allCourses.filter((c) => c.id !== Number.parseInt(courseId)).slice(0, 3)
        setRelatedCourses(filtered)

        // Verify if the user has purchased the course
        if (isAuthenticated && user) {
          try {
            // Here you should make a call to your API to verify if the user has purchased the course
            // For example: const userPurchases = await api.get('/user/purchases')
            // setHasPurchased(userPurchases.some(p => p.courseId === Number.parseInt(courseId)))

            // For now, we simulate that the user has not purchased it
            setHasPurchased(false)
          } catch (error) {
            console.error("Error verifying user purchases:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching course data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseData()
  }, [courseId, isAuthenticated, user])

  const toggleSection = (sectionId: number) => {
    if (activeSection === sectionId) {
      setActiveSection(null)
    } else {
      setActiveSection(sectionId)
    }
  }

  // Video control functions
  const togglePlay = () => {
    const newIsPlaying = VideoService.togglePlay(isPlaying, iframeRef, course?.trailer)
    setIsPlaying(newIsPlaying)
  }

  const toggleMute = () => {
    const newIsMuted = VideoService.toggleMute(isMuted, iframeRef, course?.trailer)
    setIsMuted(newIsMuted)
  }

  // Handle buy button click
  const handleBuy = async () => {
    if (!course) return

    setPurchasing(true)

    try {
      // Calculate final price
      const priceInfo = calculateDiscountedPrice(course.price, course.discount)

      // Limpiar localStorage de datos anteriores
      localStorage.removeItem("checkoutProduct")
      localStorage.removeItem("checkoutCourse")

      // Save course data to localStorage for checkout
      localStorage.setItem(
        "checkoutCourse",
        JSON.stringify({
          id: course.id,
          title: course.title,
          price: priceInfo.finalPrice,
          originalPrice: priceInfo.originalPrice,
          discount: priceInfo.discountPercentage,
          savings: priceInfo.savings,
          image: course.image,
          type: "course",
        }),
      )

      console.log("Datos del curso guardados:", {
        id: course.id,
        title: course.title,
        price: priceInfo.finalPrice,
      })

      if (!isAuthenticated) {
        // If not authenticated, save course ID and redirect to login
        localStorage.setItem("pendingPurchaseCourseId", courseId)
        router.push(`/login?redirect=/checkout?courseId=${courseId}`)
        return
      }

      // If authenticated, go directly to checkout
      router.push(`/checkout?courseId=${courseId}`)
    } catch (error) {
      console.error("Error preparing checkout:", error)
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-orange-500 border-orange-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Cargando curso...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-xl">Curso no encontrado</p>
      </div>
    )
  }

  // Calculate price with discount
  const priceInfo = calculateDiscountedPrice(course.price, course.discount)

  // Convert to local currency
  const localPrice = convertToLocalCurrency(priceInfo.finalPrice, countryInfo)

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-8 px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/cursos" className="text-orange-500 hover:text-orange-600 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cursos
          </Link>
        </div>

        {/* Video/Image Trailer */}
        <div className="relative w-full aspect-video mb-12 rounded-lg overflow-hidden">
          {course.trailer ? (
            isTrailerVideo ? (
              <div className="relative w-full h-full">
                {/* Hidden iframe with all controls disabled */}
                <iframe
                  ref={iframeRef}
                  src={VideoService.getEmbedUrl(course.trailer)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay"
                  style={{ pointerEvents: "none" }}
                  title="Video trailer"
                ></iframe>

                {/* Custom overlay with minimal controls */}
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                  {/* Custom play button */}
                  <div
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                    onClick={togglePlay}
                  >
                    {!isPlaying && (
                      <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom mute button - bottom right */}
                  <div className="absolute bottom-4 right-4 cursor-pointer" onClick={toggleMute}>
                    <div className="w-10 h-10 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                      {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src={course.trailer || "/placeholder.svg"}
                  alt={`Trailer de ${course.title}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={course.image || "/placeholder.svg?height=400&width=800&query=course video"}
                alt={course.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-white/30 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-500 border-b-8 border-b-transparent ml-1"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Info - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="text-orange-500 font-medium mb-2">CURSO</div>
              <h1 className="text-4xl font-black mb-6">{course.title}</h1>

              <p className="text-lg mb-8">{course.description}</p>

              {/* Curriculum/Sections */}
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Temario del curso</h2>
                <div className="space-y-3">
                  {course.sections
                    .sort((a, b) => a.id - b.id)
                    .map((section) => (
                      <div
                        key={section.id}
                        className="bg-gray-100 rounded-lg p-4 cursor-pointer"
                        onClick={() => toggleSection(section.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{section.title}</div>
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              activeSection === section.id ? "transform rotate-180" : ""
                            }`}
                          />
                        </div>
                        {activeSection === section.id && section.contents.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <ul className="space-y-2">
                              {section.contents.map((content) => (
                                <li key={content.id} className="flex items-center">
                                  {hasPurchased ? (
                                    content.type === "video" ? (
                                      <Play className="h-4 w-4 text-orange-500 mr-2" />
                                    ) : (
                                      <FileText className="h-4 w-4 text-orange-500 mr-2" />
                                    )
                                  ) : (
                                    <Lock className="h-4 w-4 text-gray-400 mr-2" />
                                  )}
                                  <span>{content.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Card - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              {hasPurchased ? (
                <div className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-md text-green-800 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Ya tienes acceso a este curso</span>
                  </div>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">Continuar aprendiendo</Button>
                </div>
              ) : (
                <>
                  {/* Price with better discount visualization */}
                  <div className="mb-6">
                    {/* Price in local currency - NOW FIRST */}
                    {localPrice && (
                      <div className="flex items-center mb-2">
                        <span className="text-3xl font-bold">
                          {localPrice.symbol}
                          {localPrice.price.toFixed(2)}
                        </span>
                        <span className="ml-2 text-gray-500">{localPrice.currency}</span>
                        {priceInfo.discountPercentage > 0 && (
                          <span className="ml-3 px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded">
                            {priceInfo.discountPercentage}% OFF
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price in USD - NOW SECOND */}
                    {priceInfo.discountPercentage > 0 ? (
                      <>
                        <div className="text-gray-500 text-sm">
                          Precio original: ${priceInfo.originalPrice?.toFixed(2)} USD
                        </div>
                        <div className="text-green-600 text-sm font-medium">
                          Ahorras: ${priceInfo.savings.toFixed(2)} USD
                        </div>
                        <div className="text-gray-600 text-sm mt-1">
                          <span>${priceInfo.finalPrice.toFixed(2)} USD</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-600 text-sm mt-1">
                        <span>${priceInfo.finalPrice.toFixed(2)} USD</span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-6 py-6"
                    onClick={handleBuy}
                    disabled={purchasing}
                  >
                    {purchasing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Comprar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Sigue descubriendo más valor</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedCourses.map((relatedCourse) => {
                // Calculate price with discount for each related course
                const relatedPriceInfo = calculateDiscountedPrice(relatedCourse.price, relatedCourse.discount)
                // Convert to local currency
                const relatedLocalPrice = convertToLocalCurrency(relatedPriceInfo.finalPrice, countryInfo)

                return (
                  <div key={relatedCourse.id} className="bg-white rounded-lg overflow-hidden shadow">
                    <div className="relative h-48 w-full">
                      <Image
                        src={relatedCourse.image || "/placeholder.svg?height=200&width=300"}
                        alt={relatedCourse.title}
                        fill
                        className="object-cover"
                      />
                      {relatedCourse.trailer && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                              <div className="w-0 h-0 border-t-6 border-t-transparent border-l-8 border-l-orange-500 border-b-6 border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="text-orange-500 text-sm font-medium mb-1">Curso</div>
                      <h3 className="font-bold mb-2">{relatedCourse.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{relatedCourse.description}</p>

                      {/* Price with discount for related courses */}
                      <div className="mb-4">
                        {/* Price in local currency - NOW FIRST */}
                        {relatedLocalPrice && (
                          <div className="flex items-center">
                            <span className="text-2xl font-bold">
                              {relatedLocalPrice.symbol}
                              {relatedLocalPrice.price.toFixed(2)}
                            </span>
                            <span className="ml-1 text-sm text-gray-500">{relatedLocalPrice.currency}</span>
                            {relatedPriceInfo.discountPercentage > 0 && (
                              <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                                {relatedPriceInfo.discountPercentage}% OFF
                              </span>
                            )}
                          </div>
                        )}

                        {/* Price in USD - NOW SECOND */}
                        {relatedPriceInfo.discountPercentage > 0 ? (
                          <div className="text-gray-500 text-xs mt-1">
                            ${relatedPriceInfo.originalPrice?.toFixed(2)} USD{" "}
                            <span className="line-through">${relatedPriceInfo.finalPrice.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-xs mt-1">
                            ${relatedPriceInfo.finalPrice.toFixed(2)} USD
                          </div>
                        )}
                      </div>

                      <Button
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => router.push(`/cursos/${relatedCourse.id}`)}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Comprar
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
