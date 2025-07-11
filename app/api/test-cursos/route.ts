import { NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/file-storage"

// Datos por defecto
const defaultCursosContentData = [
  {
    id: "1",
    heroTitle: "OPTI 2024 - Educación Financiera Básica",
    heroDescription:
      "Aprende los conceptos fundamentales de educación financiera de manera práctica y divertida. Este curso está diseñado para principiantes que quieren tomar control de sus finanzas personales.",
    videoId: "1091240808",
    courseDate: "Sábado, 15 de abril 2024",
    courseTime: "09:00 am - 17:00 pm",
    courseAges: "Edad: 16+ años",
    courseLocation: "Centro de Capacitación OPTI\nAv. Principal 123, La Paz\nSala de conferencias A-1",
    whatsappUrl: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20el%20curso%20OPTI%202024",
    learningTitle: "Lo que aprenderás en este curso:",
    learningItems: [
      "Conceptos básicos de educación financiera",
      "Cómo crear un presupuesto personal efectivo",
      "Estrategias de ahorro e inversión",
      "Planificación financiera a corto y largo plazo",
      "Herramientas para el control de gastos",
      "Introducción al mundo de las inversiones",
    ],
    icon1Title: "Aprendizaje Práctico",
    icon2Title: "Certificación",
    icon3Title: "Networking",
    icon1Image: "/placeholder.svg?height=40&width=40",
    icon2Image: "/placeholder.svg?height=40&width=40",
    icon3Image: "/placeholder.svg?height=40&width=40",
  },
]

export async function GET() {
  try {
    const cursosContentData = await readJsonFile("cursos-content.json", defaultCursosContentData)
    console.log("✅ API test-cursos: SUCCESS")
    return NextResponse.json(cursosContentData)
  } catch (error) {
    console.error("❌ API test-cursos ERROR:", error)
    return NextResponse.json({ error: "Failed to load cursos content" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json()
    console.log("✅ API test-cursos: Saving", newData.length, "cursos content")
    await writeJsonFile("cursos-content.json", newData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API test-cursos POST ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to save cursos content" }, { status: 500 })
  }
}
