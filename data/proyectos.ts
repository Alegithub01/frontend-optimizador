export interface Proyecto {
  id: string
  title: string
  image: string
  link: string
  featured?: boolean
  description?: string
}

export const proyectosData: Proyecto[] = [
  {
    id: "1",
    title: "OPTI 2024",
    image: "/placeholder.svg?height=200&width=300",
    link: "/proyectos/1",
    featured: false,
    description: "Programa básico de educación financiera para principiantes",
  },
  {
    id: "2",
    title: "OPTIKIDS ESCUELA FINANCIERA",
    image: "/images/optikids-detail.png",
    link: "/proyectos/2",
    featured: true,
    description: "Programa completo de educación financiera para niños y adolescentes",
  },
  {
    id: "3",
    title: "OPTI KIDS",
    image: "/placeholder.svg?height=200&width=300",
    link: "/proyectos/3",
    featured: false,
    description: "Programa avanzado de emprendimiento y liderazgo financiero",
  },
  {
    id: "4",
    title: "OPTI TEENS",
    image: "/placeholder.svg?height=200&width=300",
    link: "/proyectos/4",
    featured: false,
    description: "Programa especializado para adolescentes",
  },
  {
    id: "5",
    title: "OPTI FAMILY",
    image: "/placeholder.svg?height=200&width=300",
    link: "/proyectos/5",
    featured: false,
    description: "Programa familiar de educación financiera",
  },
]
