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
    "id": "1751919788463",
    "name": "Nuevo Testimonio",
    "description": "Descripción del testimonio",
    "avatarImage": "/placeholder.svg?height=96&width=96",
    "logoUrl": "/placeholder.svg?height=60&width=60",
    "quote": "Nueva cita inspiradora",
    "historia": "Historia del nuevo testimonio. Aquí puedes agregar la historia completa de esta persona.",
    "mainImage": "/placeholder.svg?height=400&width=300",
    "videoUrl": "https://vimeo.com/1091240808",
    "additionalImages": [
      "/placeholder.svg?height=300&width=200",
      "/placeholder.svg?height=150&width=200",
      "/placeholder.svg?height=150&width=200"
    ],
    "elementos": [
      {
        "icon": "/placeholder.svg?height=32&width=32",
        "text": "Nuevo elemento"
      }
    ]
  }
]