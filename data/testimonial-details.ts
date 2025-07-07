export interface TestimonialDetail {
  id: string
  name: string
  description: string
  avatarImage: string
  logoUrl: string
  quote: string
  historia: string
  mainImage: string
  videoUrl: string
  additionalImages: string[]
  elementos: {
    icon: string
    text: string
  }[]
}

export const testimonialDetailsData: TestimonialDetail[] = [
  {
    id: "1",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Mejorar mis energías y chakras para bienestar emocional",
    historia:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    mainImage: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-0rYK7JE3yWv1AsJ0OpXBjtmC4THIA6.png",
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
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Deporte",
      },
    ],
  },
  {
    id: "2",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Transformar mi vida a través del aprendizaje financiero",
    historia:
      "Mi historia comenzó cuando decidí tomar control de mis finanzas personales. A través de los programas de Optikids, aprendí conceptos fundamentales que cambiaron mi perspectiva sobre el dinero y las inversiones. Ahora puedo enseñar a mis hijos estos valiosos conocimientos.",
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
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Ahorro",
      },
    ],
  },
  {
    id: "3",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Desarrollar habilidades de liderazgo y emprendimiento",
    historia:
      "Como empresaria, siempre busqué maneras de mejorar mis habilidades de liderazgo. Los cursos de Optikids me proporcionaron las herramientas necesarias para crecer tanto personal como profesionalmente, especialmente en el ámbito financiero.",
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
        text: "Liderazgo",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Emprendimiento",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Innovación",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Estrategia",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Networking",
      },
    ],
  },
  {
    id: "4",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Crear un futuro financiero sólido para mi familia",
    historia:
      "La educación financiera se convirtió en una prioridad cuando me di cuenta de la importancia de planificar el futuro de mi familia. Optikids me enseñó no solo conceptos teóricos, sino aplicaciones prácticas que uso día a día.",
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
    ],
  },
  {
    id: "5",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Inspirar a otros a través de mi experiencia financiera",
    historia:
      "Después de completar mi formación en Optikids, me convertí en una defensora de la educación financiera. Mi objetivo es compartir lo que he aprendido y ayudar a otras personas a alcanzar sus metas financieras.",
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
        text: "Inspiración",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Mentoría",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Comunidad",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Impacto",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Crecimiento",
      },
      {
        icon: "/placeholder.svg?height=32&width=32",
        text: "Transformación",
      },
    ],
  },
  {
    id: "6",
    name: "Luke Marquina",
    description: "Fundadora y empresaria boliviana",
    avatarImage: "/placeholder.svg?height=96&width=96",
    logoUrl: "/placeholder.svg?height=60&width=60",
    quote: "Construir un legado financiero para las próximas generaciones",
    historia:
      "Mi visión siempre ha sido crear un impacto duradero. A través de la educación financiera que recibí en Optikids, ahora tengo las herramientas para construir un legado sólido que beneficiará a las futuras generaciones de mi familia.",
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
        text: "Legado",
      },
    ],
  },
]
