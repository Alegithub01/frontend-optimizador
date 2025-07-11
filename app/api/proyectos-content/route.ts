import { NextResponse } from "next/server"
import { readJsonFile, writeJsonFile } from "@/lib/file-storage"

// Datos por defecto (solo el primero como ejemplo, el resto está en el JSON)
const defaultProyectosContentData = [
  {
    id: "1",
    heroTitle: "OPTI 2024",
    heroSubtitle: "Programa básico financiero",
    heroImage: "/placeholder.svg?height=400&width=400",
    courseTitle: "Curso: OPTI 2024 - Educación financiera básica",
    courseDescription:
      "Nuestros cursos presenciales ofrecen una experiencia interactiva donde aprendes conceptos financieros básicos a través de actividades prácticas y dinámicas grupales.",
    courseDate: "Sábado, 15 de abril 2024",
    courseTime: "09:00 am - 17:00 pm",
    courseAge: "Edad: 16+ años",
    countdownDate: "2024-04-15T09:00:00",
    whatIsTitle: "¿Qué es OPTI 2024?",
    whatIsDescription:
      "OPTI 2024 es un programa básico de educación financiera diseñado para enseñar conceptos fundamentales sobre dinero, ahorro, inversión y planificación financiera de manera práctica y accesible.",
    firstVideoId: "https://vimeo.com/1091240808",
    secondVideoId: "",
    projectsTitle: "¿Qué proyectos tenemos para ti?",
    projectsDescription: "Descubre nuestros diferentes programas diseñados para cada etapa del aprendizaje financiero",
    project1Title: "OPTI 2024",
    project1Description: "Programa básico de educación financiera para principiantes",
    project1Image: "/placeholder.svg?height=200&width=300",
    project1WhatsApp: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20el%20programa%20OPTI%202024",
    project2Title: "OPTIKIDS ESCUELA FINANCIERA",
    project2Description: "Programa completo de educación financiera para niños y adolescentes",
    project2Image: "/placeholder.svg?height=200&width=300",
    project2WhatsApp: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20OPTIKIDS%20Escuela%20Financiera",
    project3Title: "OPTI KIDS",
    project3Description: "Programa avanzado de emprendimiento y liderazgo financiero",
    project3Image: "/placeholder.svg?height=200&width=300",
    project3WhatsApp: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20el%20programa%20OPTI%20KIDS",
  },
]

export async function GET() {
  try {
    const proyectosContentData = await readJsonFile("proyectos-content.json", defaultProyectosContentData)
    console.log("✅ API proyectos-content: SUCCESS")
    return NextResponse.json(proyectosContentData)
  } catch (error) {
    console.error("❌ API proyectos-content ERROR:", error)
    return NextResponse.json({ error: "Failed to load proyectos content" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json()
    console.log("✅ API proyectos-content: Saving", newData.length, "proyectos content")
    await writeJsonFile("proyectos-content.json", newData)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API proyectos-content POST ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to save proyectos content" }, { status: 500 })
  }
}
