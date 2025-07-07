import { NextResponse } from "next/server"

// Variable para almacenar los detalles de proyectos
let storedProyectoDetails = [
  {
    id: "1",
    heroTitle: "OPTI 2024",
    heroDescription: "Programa básico de educación financiera para principiantes",
    videoId: "1091240808",
    courseDate: "LUNES 29 DE MARZO, 2025",
    courseTime: "12:00 PM - 03:00PM",
    courseAges: "Edades: 5-9 años",
    courseLocation: "Centro de Capacitación OPTI",
    whatsappUrl: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20OPTI%202024",
    learningTitle: "¿Qué aprenderás?",
    learningItems: ["Conceptos básicos de dinero", "Importancia del ahorro", "Planificación financiera simple"],
    icon1Title: "Educación",
    icon2Title: "Práctica",
    icon3Title: "Diversión",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "2",
    heroTitle: "OPTIKIDS ESCUELA FINANCIERA",
    heroDescription: "Programa completo de educación financiera para niños y adolescentes",
    videoId: "1091240808",
    courseDate: "SÁBADO 15 DE ABRIL, 2025",
    courseTime: "10:00 AM - 04:00PM",
    courseAges: "Edades: 7-12 años",
    courseLocation: "Escuela Financiera OPTIKIDS",
    whatsappUrl: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20OPTIKIDS%20Escuela%20Financiera",
    learningTitle: "¿Qué aprenderás en OPTIKIDS?",
    learningItems: [
      "Manejo responsable del dinero",
      "Emprendimiento para niños",
      "Inversiones básicas",
      "Trabajo en equipo financiero",
    ],
    icon1Title: "Emprendimiento",
    icon2Title: "Inversión",
    icon3Title: "Liderazgo",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "3",
    heroTitle: "OPTI KIDS",
    heroDescription: "Programa avanzado de emprendimiento y liderazgo financiero",
    videoId: "1091240808",
    courseDate: "DOMINGO 20 DE MAYO, 2025",
    courseTime: "09:00 AM - 05:00PM",
    courseAges: "Edades: 8-14 años",
    courseLocation: "Campus OPTI KIDS",
    whatsappUrl: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20OPTI%20KIDS",
    learningTitle: "¿Qué aprenderás en OPTI KIDS?",
    learningItems: ["Liderazgo financiero", "Creación de empresas", "Gestión de proyectos", "Presentaciones efectivas"],
    icon1Title: "Liderazgo",
    icon2Title: "Innovación",
    icon3Title: "Éxito",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "4",
    heroTitle: "OPTI AVANZADO",
    heroDescription: "Programa especializado para jóvenes emprendedores",
    videoId: "1091240808",
    courseDate: "VIERNES 25 DE JUNIO, 2025",
    courseTime: "02:00 PM - 06:00PM",
    courseAges: "Edades: 12-16 años",
    courseLocation: "Centro Avanzado OPTI",
    whatsappUrl: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20OPTI%20AVANZADO",
    learningTitle: "¿Qué aprenderás en OPTI AVANZADO?",
    learningItems: ["Estrategias de inversión", "Análisis financiero", "Marketing digital", "Networking profesional"],
    icon1Title: "Estrategia",
    icon2Title: "Análisis",
    icon3Title: "Networking",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
  {
    id: "5",
    heroTitle: "OPTI PREMIUM",
    heroDescription: "Programa exclusivo con mentoría personalizada",
    videoId: "1091240808",
    courseDate: "SÁBADO 30 DE JULIO, 2025",
    courseTime: "08:00 AM - 06:00PM",
    courseAges: "Edades: 14-18 años",
    courseLocation: "Campus Premium OPTI",
    whatsappUrl: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20OPTI%20PREMIUM",
    learningTitle: "¿Qué aprenderás en OPTI PREMIUM?",
    learningItems: [
      "Mentoría personalizada",
      "Casos de estudio reales",
      "Conexiones empresariales",
      "Certificación avanzada",
    ],
    icon1Title: "Mentoría",
    icon2Title: "Certificación",
    icon3Title: "Exclusividad",
    icon1Image: "/placeholder.svg?height=80&width=80",
    icon2Image: "/placeholder.svg?height=80&width=80",
    icon3Image: "/placeholder.svg?height=80&width=80",
  },
]

export async function GET() {
  try {
    console.log("API: Getting proyecto details")
    return NextResponse.json(storedProyectoDetails)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(storedProyectoDetails)
  }
}

export async function POST(request: Request) {
  try {
    const details = await request.json()
    console.log("API: Saving proyecto details:", details.length)

    storedProyectoDetails = details

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error saving:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
