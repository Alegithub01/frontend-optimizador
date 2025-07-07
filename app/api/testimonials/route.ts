import { NextResponse } from "next/server"

// Variable para almacenar los datos en memoria (en producción usarías una base de datos)
let storedTestimonials = [
  {
    id: "1",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    coverImage: "/placeholder.svg?height=300&width=400",
    videoUrl: "https://vimeo.com/1091240808",
    avatarImage: "/placeholder.svg?height=48&width=48",
    logoImage: "/placeholder.svg?height=30&width=30",
  },
  {
    id: "2",
    name: "María González",
    description: "Emprendedora exitosa",
    coverImage: "/placeholder.svg?height=300&width=400",
    videoUrl: "https://vimeo.com/1091240808",
    avatarImage: "/placeholder.svg?height=48&width=48",
    logoImage: "/placeholder.svg?height=30&width=30",
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    description: "Inversor y mentor",
    coverImage: "/placeholder.svg?height=300&width=400",
    videoUrl: "https://vimeo.com/1091240808",
    avatarImage: "/placeholder.svg?height=48&width=48",
    logoImage: "/placeholder.svg?height=30&width=30",
  },
]

export async function GET() {
  try {
    console.log("API: Getting testimonials")
    return NextResponse.json(storedTestimonials)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(storedTestimonials)
  }
}

export async function POST(request: Request) {
  try {
    const testimonials = await request.json()
    console.log("API: Saving testimonials:", testimonials.length)

    // Guardar los datos en la variable (en producción sería en base de datos)
    storedTestimonials = testimonials

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error saving:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
