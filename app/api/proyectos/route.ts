import { NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/file-storage"

// Datos por defecto
const defaultProyectosData = [
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
    const proyectosData = await readJsonFile("proyectos.json", defaultProyectosData)
    console.log("✅ API proyectos: SUCCESS")
    return NextResponse.json(proyectosData)
  } catch (error) {
    console.error("❌ API proyectos ERROR:", error)
    return NextResponse.json({ error: "Failed to load proyectos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json()
    console.log("✅ API proyectos: Saving", newData.length, "proyectos")
    await writeJsonFile("proyectos.json", newData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API proyectos POST ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to save proyectos" }, { status: 500 })
  }
}
