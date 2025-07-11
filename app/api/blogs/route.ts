import { NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/file-storage"

// Datos por defecto
const defaultBlogsData = [
  {
    id: "1",
    date: "01-04-2024",
    author: "por Nochur Crosby",
    title: "¿Qué es marketing en negocios?",
    description:
      "Descubre los fundamentos del marketing empresarial y cómo puede transformar tu negocio. Aprende estrategias efectivas para llegar a tu audiencia objetivo.",
    image: "/placeholder.svg?height=200&width=300",
    slug: "que-es-marketing-en-negocios",
  },
  {
    id: "2",
    date: "15-04-2024",
    author: "por María González",
    title: "Estrategias de inversión para principiantes",
    description:
      "Una guía completa para comenzar en el mundo de las inversiones. Conoce los conceptos básicos y las mejores prácticas para invertir de manera inteligente.",
    image: "/placeholder.svg?height=200&width=300",
    slug: "estrategias-inversion-principiantes",
  },
  {
    id: "3",
    date: "30-04-2024",
    author: "por Carlos Rodríguez",
    title: "Educación financiera para niños",
    description:
      "Aprende cómo enseñar conceptos financieros básicos a los más pequeños de la casa. Herramientas y técnicas para formar futuros emprendedores.",
    image: "/placeholder.svg?height=200&width=300",
    slug: "educacion-financiera-ninos",
  },
]

export async function GET() {
  try {
    const blogsData = await readJsonFile("blogs.json", defaultBlogsData)
    console.log("✅ API blogs: SUCCESS")
    return NextResponse.json(blogsData)
  } catch (error) {
    console.error("❌ API blogs ERROR:", error)
    return NextResponse.json({ error: "Failed to load blogs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json()
    console.log("✅ API blogs: Saving", newData.length, "blogs")
    await writeJsonFile("blogs.json", newData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API blogs POST ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to save blogs" }, { status: 500 })
  }
}
