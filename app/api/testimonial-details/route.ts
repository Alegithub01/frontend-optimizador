import { NextResponse } from "next/server"

// Variable para almacenar los datos en memoria (en producción usarías una base de datos)
let storedDetails = [
  {
    id: "1",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Mejorar mis energías y chakras para bienestar emocional",
    historia:
      "Mi historia comenzó cuando decidí tomar control de mi vida financiera y personal. A través de los programas, aprendí conceptos fundamentales que cambiaron mi perspectiva sobre el dinero y las inversiones.",
    mainImage: "/placeholder.svg?height=400&width=300",
    videoUrl: "https://vimeo.com/1091240808",
    additionalImages: [
      "/placeholder.svg?height=300&width=200",
      "/placeholder.svg?height=150&width=200",
      "/placeholder.svg?height=150&width=200",
    ],
    elementos: [
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Alimentación",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Energía",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Meditación",
      },
    ],
  },
  {
    id: "2",
    name: "María González",
    description: "Emprendedora exitosa",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Transformar mi vida a través del aprendizaje financiero",
    historia:
      "Como emprendedora, siempre busqué maneras de mejorar mis habilidades financieras. Los programas me proporcionaron las herramientas necesarias para crecer tanto personal como profesionalmente.",
    mainImage: "/placeholder.svg?height=400&width=300",
    videoUrl: "https://vimeo.com/1091240808",
    additionalImages: [
      "/placeholder.svg?height=300&width=200",
      "/placeholder.svg?height=150&width=200",
      "/placeholder.svg?height=150&width=200",
    ],
    elementos: [
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Planificación",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Inversión",
      },
    ],
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    description: "Inversor y mentor",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Crear un futuro financiero sólido para mi familia",
    historia:
      "La educación financiera se convirtió en una prioridad cuando me di cuenta de la importancia de planificar el futuro de mi familia. Ahora tengo las herramientas para construir un legado sólido.",
    mainImage: "/placeholder.svg?height=400&width=300",
    videoUrl: "https://vimeo.com/1091240808",
    additionalImages: [
      "/placeholder.svg?height=300&width=200",
      "/placeholder.svg?height=150&width=200",
      "/placeholder.svg?height=150&width=200",
    ],
    elementos: [
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Familia",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Futuro",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Legado",
      },
    ],
  },
]

export async function GET() {
  try {
    console.log("API: Getting testimonial details")
    return NextResponse.json(storedDetails)
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(storedDetails)
  }
}

export async function POST(request: Request) {
  try {
    const details = await request.json()
    console.log("API: Saving testimonial details:", details.length)

    // Guardar los datos en la variable (en producción sería en base de datos)
    storedDetails = details

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API Error saving:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 })
  }
}
