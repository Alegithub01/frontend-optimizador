import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FeaturedCourse {
  id: number
  title: string
  description: string
  image: string
}

interface FeaturedCourseCardProps {
  course: FeaturedCourse
}

export default function FeaturedCourseCard({ course }: FeaturedCourseCardProps) {
  return (
    <div className="relative h-[500px] group overflow-hidden rounded-2xl">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src={course.image || "/placeholder.svg?height=500&width=400"}
          alt={course.title}
          fill
          className="object-cover brightness-50 group-hover:brightness-40 transition-all duration-300"
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
        <h3 className="text-2xl font-bold mb-3">{course.title}</h3>
        <p className="text-gray-300 mb-6">{course.description}</p>

        <Link href={`/cursos/${course.id}`}>
          <Button className="bg-orange-700 hover:bg-orange-500 text-black w-full md:w-auto rounded-full">
            Acceder al curso
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  )
}
