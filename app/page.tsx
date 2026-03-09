  "use client"
  import Link from "next/link"
  import { ChevronRight } from "lucide-react"
  import { Button } from "@/components/ui/button"
  import CategoryCard from "@/components/category-card"
  import FeaturedCourseCard from "@/components/featured-course-card"
  import ProductCategoryCard from "@/components/product-category-card"
  import HeroAvatar from "@/components/hero-avatar"
  import EventsSection from "@/components/eventos-section"
  import TestimonialsSection from "@/components/testimonios-section"
  import CTASection from "@/components/cta-section"
  import ProyectosSection from "@/components/proyectos-sections"
  import { useEffect, useState } from "react"
  import { usePathname } from "next/navigation"
  import { api } from "@/lib/api"

  export default function Home() {
    const pathname = usePathname() // Track current path to force HeroAvatar re-mount
    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      const fetchCourses = async () => {
        setLoading(true)
        setError(null)
        try {
          const data = await api.get<any[]>("/courses")
          setCourses(data)
        } catch (err: any) {
          setError(err.message || "Error al cargar los cursos")
        } finally {
          setLoading(false)
        }
      }
      fetchCourses()
    }, [])

    const productCategories = [
      {
        id: 1,
        title: "Libros",
        image: "/libro.png",
        href: "/productos/libro",
      },
      {
        id: 2,
        title: "Revistas",
        image: "/revista.png",
        href: "/productos/revista",
      },
      {
        id: 3,
        title: "Toolkit",
        image: "/blanco.png",
        href: "/productos/toolkit",
      },
      {
        id: 4,
        title: "E-kit",
        image: "/ekit.png",
        href: "/productos/e-kit",
      },
    ]

    return (
      <div className="min-h-[100vh] bg-black text-white">
        {/* Hero Section con Avatar 3D */}
        <HeroAvatar key={pathname} />
        <div className="bg-white">
          {/* Featured Courses Section */}
          <section id="cursos" className="container mx-auto py-12 md:py-20 px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* IZQUIERDA - fija */}
              <div className="w-full lg:w-[20%] lg:shrink-0 mb-8 lg:mb-12 flex flex-col justify-center text-center lg:text-left">
                <div className="mb-6 lg:mb-10">
                  <h2 className="text-lg font-medium text-orange-700">Programas y</h2>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl text-black font-extrablack">CURSOS</h3>
                </div>

                <p className="text-gray-3 mb-8 lg:mb-20">
                  <strong className="text-black">Descubre tu potencial</strong>, domina nuevas habilidades con nuestros
                  cursos y programas diseñados para llevarte al siguiente nivel.
                </p>

                {/* ✅ Botón visible solo en escritorio */}
                <Link
                  href="/cursos"
                  className="hidden lg:flex items-center justify-start text-gray-2 font-semibold hover:text-orange-700 text-lg px-4 py-2"
                >
                  Todos los cursos
                  <ChevronRight className="h-6 w-6 ml-2" />
                </Link>
              </div>

              {/* DERECHA - scroll horizontal */}
              <div className="overflow-x-auto w-full">
                <div className="flex gap-4 md:gap-6 min-w-max">
                  {loading && <p className="text-black">Cargando cursos...</p>}
                  {error && <p className="text-red-600">{error}</p>}
                  {!loading && !error && courses.length === 0 && <p className="text-black">No hay cursos disponibles.</p>}
                  {!loading &&
                    !error &&
                    courses.map((course) => (
                      <div key={course.id} className="w-64 md:w-72 shrink-0">
                        <FeaturedCourseCard course={course} />
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* ✅ Botón móvil (solo visible en pantallas pequeñas) */}
            <div className="mt-8 flex lg:hidden justify-center">
              <Link
                href="/cursos"
                className="flex items-center rounded-full text-black font-semibold bg-orange-700 hover:text-orange-500 text-lg px-4 py-2"
              >
                Todos los cursos
                <img src="/botones/arrowRigth.svg" alt="Flecha" className="h-6 w-6" />
              </Link>
            </div>
          </section>

          {/* Events Section */}
          <section id="eventos" className="container mx-auto py-12 md:py-0 px-4">
            <EventsSection />
          </section>

          {/* Products Section */}
          <section id="productos" className="container mx-auto py-12 md:py-0 px-4">
            <div className="mb-8 md:mb-12 text-center">
              <h2 className="text-lg font-medium text-orange-700 mb-4">Categoría</h2>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">PRODUCTOS</h3>
            </div>

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 md:grid-cols-3 mb-8">
              {productCategories.map((category, index) => (
                <div
    key={category.id}
    className={`
      ${productCategories.length % 3 !== 0 && index === productCategories.length - 1
        ? "md:col-span-3 md:flex md:justify-center"
        : ""}
      ${productCategories.length % 2 !== 0 && index === productCategories.length - 1
        ? "sm:col-span-2 sm:flex sm:justify-center"
        : ""}
    `}
  >
    <div className="w-full max-w-[280px]">
      <ProductCategoryCard category={category} />
    </div>
  </div>

              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="/productos"
                className="hidden lg:flex items-center text-gray-2 font-semibold hover:text-orange-500 transition-colors text-lg px-4 py-2"
              >
                Todos los productos
                <ChevronRight className="h-6 w-6 ml-2" />
              </Link>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonios" className="container mx-auto py-12 md:py-0 px-4">
            <TestimonialsSection/>
            
            {/* Botón "Todos los testimonios" */}
            <div className="mt-8 flex justify-center">
              <Link
                href="/testimonios"
                className="flex items-center font-semibold text-lg px-4 py-2
                          /* Estilos mobile (por defecto) */
                          bg-orange-700 text-black rounded-full
                          /* Estilos desktop */
                          lg:bg-transparent lg:text-gray-2 hover:text-orange-500 lg:rounded-none transition-colors"
              >
                Todos los testimonios
                {/* Flecha para mobile (SVG) - hidden en desktop */}
                <img 
                  src="/botones/arrowRigth.svg" 
                  alt="Flecha" 
                  className="h-6 w-6 ml-2 lg:hidden" 
                />
                {/* Flecha para desktop (Lucide) - hidden en mobile */}
                <ChevronRight className="h-6 w-6 ml-2 hidden lg:block" />
              </Link>
            </div>
          </section>
          {/* Mentoring CTA Section */}
          <CTASection />

          <ProyectosSection/>
        </div>
      </div>
    )
  }