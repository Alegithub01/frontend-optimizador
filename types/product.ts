export interface ToolkitSection {
  id?: number
  title: string
  videoUrl?: string
  description?: string
  fileUrl?: string
  downloadUrl?: string
  createdAt?: Date
}

export interface Product {
  id?: string
  name: string
  author: string
  price: number
  physicalPrice?: number
  stock: number
  image: string
  extraImageUrl?: string
  extraImageUrlDos?: string
  gifUrl?: string
  category: "libro" | "revista" | "toolkit" | "e-kit"
  subCategory?: "energia" | "alimentacion" | "meditacion" | "negocio"
  description: string
  pdfUrl?: string // Para libros y revistas
  sections?: ToolkitSection[] // Para toolkits y e-kit
  createdAt?: Date
  updatedAt?: Date
  trailerUrl?: string
}
