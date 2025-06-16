import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin } from "lucide-react"

interface Event {
  id: number
  title: string
  description: string
  date: string
  location: string
  image: string
}

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all flex flex-col md:flex-row">
      <div className="relative h-48 md:h-auto md:w-2/5">
        <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
      </div>

      <div className="p-6 md:w-3/5">
        <h3 className="text-xl font-bold mb-2 text-gray-900">{event.title}</h3>
        <p className="text-gray-600 mb-4">{event.description}</p>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            {event.date}
          </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              <a href={event.location} target="_blank" rel="noopener noreferrer" className="hover:underline">
                Ver ubicación en Google Maps
              </a>
            </div>

        </div>

        <div className="flex gap-2">
          <Link href={`/eventos/${event.id}`}>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Reservar Plaza</Button>
          </Link>
          <Button variant="outline" className="border-gray-300 hover:bg-gray-50 text-gray-700">
            Más Información
          </Button>
        </div>
      </div>
    </div>
  )
}
