import { NextResponse } from "next/server"

// Variable para almacenar los datos (se puede editar)
let cursosData = [
  {
    id: "1",
    heroTitle: "OPTI 2024 - Educación Financiera",
    heroDescription: "Programa básico de educación financiera para principiantes",
    videoId: "1091240808",
    courseDate: "SÁBADO 15 DE ABRIL, 2024",
    courseTime: "09:00 AM - 05:00 PM",
    courseAges: "Edades: 16+ años",
    courseLocation: "Centro de Capacitación OPTI",
    whatsappUrl: "https://wa.me/1234567890",
    learningTitle: "¿Qué aprenderás en OPTI 2024?",
    learningItems: ["Conceptos básicos", "Estrategias de ahorro", "Planificación financiera"],
    icon1Title: "Educación",
    icon2Title: "Práctica",
    icon3Title: "Resultados",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "2",
    heroTitle: "OPTIKIDS Escuela Financiera",
    heroDescription: "Programa completo de educación financiera para niños",
    videoId: "1091240808",
    courseDate: "SÁBADO 10 DE MAYO, 2024",
    courseTime: "10:00 AM - 04:00 PM",
    courseAges: "Edades: 7 a 9 años",
    courseLocation: "Escuela Financiera OPTIKIDS",
    whatsappUrl: "https://wa.me/1234567890",
    learningTitle: "¿Qué aprenderás en OPTIKIDS?",
    learningItems: ["Dinero básico", "Juegos financieros", "Emprendimiento para niños"],
    icon1Title: "Diversión",
    icon2Title: "Aprendizaje",
    icon3Title: "Crecimiento",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "3",
    heroTitle: "OPTI KIDS - Emprendimiento",
    heroDescription: "Programa avanzado de emprendimiento y liderazgo financiero",
    videoId: "1091240808",
    courseDate: "DOMINGO 20 DE MAYO, 2024",
    courseTime: "09:00 AM - 06:00 PM",
    courseAges: "Edades: 10 a 15 años",
    courseLocation: "Campus OPTI KIDS",
    whatsappUrl: "https://wa.me/1234567890",
    learningTitle: "¿Qué aprenderás en OPTI KIDS?",
    learningItems: ["Liderazgo", "Ideas de negocio", "Presentaciones", "Trabajo en equipo"],
    icon1Title: "Liderazgo",
    icon2Title: "Innovación",
    icon3Title: "Éxito",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "4",
    heroTitle: "OPTI AVANZADO - Estrategias",
    heroDescription: "Programa especializado para jóvenes emprendedores",
    videoId: "1091240808",
    courseDate: "VIERNES 25 DE JUNIO, 2024",
    courseTime: "02:00 PM - 08:00 PM",
    courseAges: "Edades: 16+ años",
    courseLocation: "Centro Avanzado OPTI",
    whatsappUrl: "https://wa.me/1234567890",
    learningTitle: "¿Qué aprenderás en OPTI AVANZADO?",
    learningItems: ["Análisis financiero", "Estrategias de inversión", "Marketing digital"],
    icon1Title: "Estrategia",
    icon2Title: "Análisis",
    icon3Title: "Networking",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "5",
    heroTitle: "OPTI PREMIUM - Mentoría",
    heroDescription: "Programa exclusivo con mentoría personalizada",
    videoId: "1091240808",
    courseDate: "SÁBADO 30 DE JULIO, 2024",
    courseTime: "08:00 AM - 06:00 PM",
    courseAges: "Edades: 18+ años",
    courseLocation: "Campus Premium OPTI",
    whatsappUrl: "https://wa.me/1234567890",
    learningTitle: "¿Qué aprenderás en OPTI PREMIUM?",
    learningItems: ["Mentoría 1:1", "Casos empresariales", "Red de contactos"],
    icon1Title: "Mentoría",
    icon2Title: "Certificación",
    icon3Title: "Exclusividad",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
]

export async function GET() {
  console.log("🧪 TEST API: Devolviendo", cursosData.length, "cursos")
  return NextResponse.json(cursosData)
}

export async function POST(request: Request) {
  try {
    const newData = await request.json()
    console.log("🧪 TEST API: Guardando cambios")
    cursosData = newData
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("🧪 TEST API: Error guardando:", error)
    return NextResponse.json({ success: false, error: "Error al guardar" }, { status: 500 })
  }
}
