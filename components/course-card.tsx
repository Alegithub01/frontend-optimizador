import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Course {
  id: number
  title: string
  description: string
  category: string
  price: number
  image: string
}

interface CourseCardProps {
  course: Course
}

export default function CourseCard({ course }: CourseCardProps) {
  const categoryColors: Record<string, string> = {
    Energía: "bg-orange-500",
    Alimentación: "bg-green-500",
    Meditación: "bg-purple-500",
    Negocio: "bg-blue-500",
  }

  const truncateAtFirstPeriod = (text: string) => {
    const periodIndex = text.indexOf('.')
    if (periodIndex === -1) return text // Si no hay punto, devolver todo
    return text.substring(0, periodIndex + 1) + (text.length > periodIndex + 1 ? '..' : '')
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
      <div className="relative h-48">
        <Image 
          src={course.image || "/placeholder.svg"} 
          alt={course.title} 
          fill 
          className="object-cover" 
        />
        <div
          className={`absolute top-4 left-4 ${categoryColors[course.category]} px-3 py-1 rounded-full text-sm font-medium text-white`}
        >
          {course.category}
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{course.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {truncateAtFirstPeriod(course.description)}
        </p>

        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-gray-900">${course.price}</span>
          <Link href={`/cursos/${course.id}`}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Ver Detalles</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
