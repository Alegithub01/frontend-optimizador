import { NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/file-storage"

// Datos por defecto
const defaultTestimonialsData = [
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
    const testimonialsData = await readJsonFile("testimonials.json", defaultTestimonialsData)
    console.log("API: Getting testimonials")
    return NextResponse.json(testimonialsData)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(defaultTestimonialsData)
  }
}

export async function POST(request: Request) {
  try {
    const testimonials = await request.json()
    console.log("API: Saving testimonials:", testimonials.length)
    await writeJsonFile("testimonials.json", testimonials)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error saving:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
