"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import FeaturedCourseCard from "./featured-course-card"

interface Course {
  id: number
  title: string
  description: string
  price?: string
  discount?: string
  image: string
  isFree?: boolean
}

interface CourseCarouselProps {
  courses: Course[]
}

export default function CourseCarousel({ courses }: CourseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!courses || courses.length === 0) {
    return null
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === courses.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? courses.length - 1 : prevIndex - 1
    )
  }

  const currentCourse = courses[currentIndex]

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4">
      <div className="relative">
        {/* Card del curso actual */}
        <FeaturedCourseCard course={currentCourse} />

        {/* Controles del carrusel */}
        {courses.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors z-20 shadow-lg"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full transition-colors z-20 shadow-lg"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores */}
            <div className="flex justify-center gap-2 mt-4">
              {courses.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-orange-500 w-6"
                      : "bg-gray-400 hover:bg-gray-300"
                  }`}
                  aria-label={`Ir al curso ${index + 1}`}
                />
              ))}
            </div>

            {/* Contador */}
            <p className="text-center text-white/70 text-sm mt-2">
              Curso {currentIndex + 1} de {courses.length}
            </p>
          </>
        )}
      </div>
    </div>
  )
}