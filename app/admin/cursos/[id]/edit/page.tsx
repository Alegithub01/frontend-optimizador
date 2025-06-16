
import Link from "next/link"
import { CourseForm } from "@/components/course-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" asChild className="mb-6">
        <Link href={`/admin/cursos/${params.id}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a detalles
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Editar Curso</h1>

      <CourseForm courseId={params.id} />
    </div>
  )
}
