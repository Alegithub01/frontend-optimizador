import { Suspense } from "react"
import Link from "next/link"
import { CourseDetail } from "@/components/course-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CoursePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/admin/cursos">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Link>
      </Button>

      <Suspense fallback={<div>Cargando detalles del curso...</div>}>
        <CourseDetail id={params.id} />
      </Suspense>
    </div>
  )
}
