import { NextResponse } from "next/server"

// Variable para almacenar los datos en memoria
let storedProyectos = [
  {
    id: "1",
    title: "OPTI 2024",
    image: "/placeholder.svg?height=300&width=400",
    link: "/proyectos/1",
    featured: false,
  },
  {
    id: "2",
    title: "OPTIKIDS ESCUELA FINANCIERA",
    image: "/placeholder.svg?height=400&width=300",
    link: "/proyectos/2",
    featured: true,
  },
  {
    id: "3",
    title: "OPTI KIDS",
    image: "/placeholder.svg?height=300&width=400",
    link: "/proyectos/3",
    featured: false,
  },
  {
    id: "4",
    title: "OPTI AVANZADO",
    image: "/placeholder.svg?height=300&width=400",
    link: "/proyectos/4",
    featured: false,
  },
  {
    id: "5",
    title: "OPTI PREMIUM",
    image: "/placeholder.svg?height=300&width=400",
    link: "/proyectos/5",
    featured: false,
  },
]

export async function GET() {
  try {
    console.log("API: Getting proyectos")
    return NextResponse.json(storedProyectos)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(storedProyectos)
  }
}

export async function POST(request: Request) {
  try {
    const proyectos = await request.json()
    console.log("API: Saving proyectos:", proyectos.length)

    // Guardar los datos en la variable
    storedProyectos = proyectos

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error saving:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
