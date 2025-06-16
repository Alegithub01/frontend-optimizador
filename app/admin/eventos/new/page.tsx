import Link from "next/link"
import { EventForm } from "@/components/event-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NewEventPage() {
  return (
    <div className="container mx-auto py-10">
      <Button variant="outline" asChild className="mb-6">
        <Link href="/admin/eventos">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-6">Crear Nuevo Evento</h1>

      <EventForm />
    </div>
  )
}
