"use client"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import CategoryCard from "@/components/category-card"
import FeaturedCourseCard from "@/components/featured-course-card"
import ProductCategoryCard from "@/components/product-category-card"
import Lottie from "lottie-react"
import animacionLogo from "@/public/animations/logo-animacion-start.json"
import EventsSection from "@/components/eventos-section"
import TestimonialsSection from "@/components/testimonios-section"
import CTASection from "@/components/cta-section"
import ProyectosSection from "@/components/proyectos-sections"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"

export default function Home() {
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
  ]

  const testimonials = [
    {
      id: "1",
      name: "Kelly Queen",
      title: "Emprendedora",
      country: "boliviana",
      image: "https://res.cloudinary.com/dyuzrs87l/image/upload/v1750707240/KELLY1_loco2c.jpg",
      iconColor: "#20c997",
      vimeoId: "1089335881"
    },
    {
      id: "2",
      name: "Luz Marquina",
      title: "Emprendedora",
      country: "boliviana",
      image: "https://res.cloudinary.com/dyuzrs87l/image/upload/v1750707240/LUZ1_vex832.jpg",
      iconColor: "#ffffff",
      vimeoId: "1089335914"
    },
    {
      id: "3",
      name: "Luka Marquina",
      title: "Emprendedora",
      country: "boliviana",
      image: "https://res.cloudinary.com/dyuzrs87l/image/upload/v1750707240/LUKA3_rc38lj.jpg",
      iconColor: "#0d6efd",
      vimeoId: "1089335939"
    },
  ]

  const proyectos = [
    {
      id: "1",
      title: "",
      image: "/proyecto-1.jpg",
      link: "/proyectos/1",
    },
    {
      id: "2",
      title: "",
      image: "/proyecto-2.jpg",
      link: "/proyectos/2",
    },
    {
      id: "3",
      title: "OPTI KIDS",
      image: "https://res.cloudinary.com/dyuzrs87l/image/upload/v1749226552/PersonajeOptikidsTutores_d1lnmh.png",
      link: "/proyectos/3",
      featured: true,
    },
    {
      id: "4",
      title: "",
      image: "/proyecto-4.png",
      link: "/proyectos/4",
    },
    {
      id: "5",
      title: "",
      image: "/proyecto-5.jpg",
      link: "/proyectos/5",
    },
  ]

  return (
    <div className="min-h-[100vh] bg-black text-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 text-center relative h-screen flex flex-col justify-center items-center">
        <h1 className="text-3xl md:text-4xl lg:text-6xl font-sans mb-8 md:mb-12 leading-tight">
          ¿QUÉ TE FALTA PARA SER FELIZ?
        </h1>

        <div className="relative w-48 h-48 md:w-80 md:h-80 mx-auto mb-8 md:mb-16">
          <div className="w-full h-full relative glow-strong">
            <Lottie animationData={animacionLogo} loop autoplay className="object-contain w-full h-full" />
          </div>
        </div>

        <Button className="bg-white text-black hover:bg-orange-700 hover:text-white transition-colors px-6 md:px-8 py-3 md:py-6 text-base md:text-lg rounded-full">
          Descúbrelo
        </Button>
      </section>

      {/* Categories Section - Hidden on mobile */}
      <section className="hidden md:block container mx-auto py-12 md:py-20 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <CategoryCard
            title="Energía"
            icon="/energia-icon.svg"
            color="from-orange-500 to-yellow-500"
            position="top-left"
          />
          <CategoryCard
            title="Alimentación"
            icon="/alimentacion-icon.svg"
            color="from-green-500 to-green-400"
            position="top-right"
          />
          <CategoryCard
            title="Meditación"
            icon="/meditacion-icon.svg"
            color="from-purple-500 to-purple-400"
            position="bottom-left"
          />
          <CategoryCard
            title="Negocio"
            icon="/negocio-icon.svg"
            color="from-blue-500 to-blue-400"
            position="bottom-right"
          />
        </div>
      </section>

      <div className="bg-white">
        {/* Featured Courses Section */}
        <section id="cursos" className="container mx-auto py-12 md:py-20 px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* IZQUIERDA - fija */}
            <div className="w-full lg:w-[20%] lg:shrink-0 mb-8 lg:mb-12 flex flex-col justify-center text-center lg:text-left">
              <div className="mb-6 lg:mb-10">
                <h2 className="text-lg font-medium text-orange-700">Programas y</h2>
                <h3 className="text-3xl md:text-4xl lg:text-5xl text-black font-black">CURSOS</h3>
              </div>

              <p className="text-gray-400 mb-8 lg:mb-20">
                <strong className="text-black">Descubre tu potencial</strong>, domina nuevas habilidades con nuestros
                cursos y programas diseñados para llevarte al siguiente nivel.
              </p>

              <Link
              href="/cursos"
              className="flex items-center justify-center lg:justify-start text-gray-400 font-semibold hover:text-orange-700 text-lg px-4 py-2"
            >
              Todos los cursos
              <ChevronRight className="h-6 w-6 ml-2" />
            </Link>
            </div>

            {/* DERECHA - scroll horizontal */}
            <div className="overflow-x-auto w-full">
              <div className="flex gap-4 md:gap-6 min-w-max pb-4">
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
        </section>

        {/* Events Section */}
        <section id="eventos" className="container mx-auto py-12 md:py-20 px-4">
          <EventsSection />
        </section>

        {/* Products Section */}
        <section id="productos" className="container mx-auto py-12 md:py-20 px-4">
          <div className="mb-8 md:mb-12 text-center">
            <h2 className="text-lg font-medium text-orange-700 mb-4">Categoría</h2>
            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">PRODUCTOS</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-12 mb-8">
            {productCategories.map((category) => (
              <ProductCategoryCard key={category.id} category={category} />
            ))}
          </div>

          <div className="flex justify-center">
            <Link href="/productos" className="flex items-center text-gray-400 hover:text-orange-700 text-lg px-4 py-2">
              Todos los productos
              <ArrowRight className="h-5 w-5 ml-1" />
            </Link>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonios" className="container mx-auto py-12 md:py-20 px-4">
          <TestimonialsSection testimonials={testimonials} />
        </section>
        {/* Mentoring CTA Section */}
        <CTASection />

        <ProyectosSection proyectos={proyectos} />
      </div>
    </div>
  )
}
