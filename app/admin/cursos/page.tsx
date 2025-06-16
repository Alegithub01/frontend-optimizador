import { Suspense } from "react"
import Link from "next/link"
import { CourseList } from "@/components/course-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Administración de Cursos</h1>
        <Button asChild>
          <Link href="/admin/cursos/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Curso
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Cargando cursos...</div>}>
        <CourseList />
      </Suspense>
    </div>
  )
}
