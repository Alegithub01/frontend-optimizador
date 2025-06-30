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
      {/* Versión Desktop (original) */}
      <div className="hidden md:block absolute inset-0 w-full h-full">
        <Image
          src={course.image || "/placeholder.svg?height=500&width=400"}
          alt={course.title}
          fill
          className="object-cover brightness-50 group-hover:brightness-40 transition-all duration-300"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-6 z-10">
          <h3 className="text-2xl font-bold mb-3 text-white">{course.title}</h3>
          <p className="text-white mb-6">{course.description}</p>
          <Link href={`/cursos/${course.id}`}>
            <Button className="bg-orange-700 hover:bg-orange-500 text-black w-full md:w-auto rounded-full">
              Acceder al curso
              <img src="/botones/arrowRigth.svg" alt="Flecha" className="h-5 w-5 ml-2 inline-block" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Versión Mobile (mejorada) */}
      <div className="md:hidden flex flex-col bg-white rounded-2xl overflow-hidden">
        {/* Contenedor de imagen con título superpuesto */}
        <div className="relative h-[250px] w-full overflow-hidden">
          <Image
            src={course.image || "/placeholder.svg"}
            alt={course.title}
            fill
            className="object-cover brightness-50"
          />
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-xl font-bold text-white">{course.title}</h3>
          </div>
        </div>

        {/* Área de contenido inferior - Altura ajustada */}
        <div className="p-4 pt-2">
          {/* Descripción y botón individual en la misma línea */}
          <div className="flex items-center gap-4">
            <p className="text-black font-medium flex-1 line-clamp-4">{course.description}</p>

            {/* Solo el botón individual de cada curso */}
            <Link href={`/cursos/${course.id}`}>
              <Button className="hover:bg-orange-600 text-gray-2 p-3 flex-shrink-0">
                <img src="/botones/arrowRigthP.svg" alt="Flecha" className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
