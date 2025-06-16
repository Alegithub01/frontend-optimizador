import Image from "next/image"

interface Event {
  id: number
  title: string
  description: string
  date: string
  month: string
  year: string
  image: string
  logo: string
}

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="flex flex-col md:flex-row bg-black border border-gray-800 rounded-lg overflow-hidden">
      {/* Left side - Image */}
      <div className="relative w-full md:w-1/3 h-64 md:h-auto">
        <Image
          src={event.image || "/placeholder.svg?height=400&width=300"}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Middle - Date and Info */}
      <div className="p-6 md:w-2/5 flex flex-col justify-center">
        <div className="flex items-center mb-4">
          <div className="text-center mr-4">
            <div className="text-5xl font-bold">{event.date}</div>
            <div className="text-xl font-bold">{event.month}</div>
            <div className="text-lg text-gray-400">{event.year}</div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">{event.title}</h3>
            <p className="text-gray-400">{event.description}</p>
          </div>
        </div>
      </div>

      {/* Right - Logo */}
      <div className="p-6 md:w-1/4 flex items-center justify-center bg-black">
        <div className="relative w-32 h-32">
          <Image
            src={event.logo || "/placeholder.svg?height=100&width=100"}
            alt={`${event.title} logo`}
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
}
