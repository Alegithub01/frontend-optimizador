export interface ToolkitSection {
  id?: number
  title: string
  videoUrl?: string
  description?: string
  fileUrl?: string
  createdAt?: Date
}

export interface Product {
  id?: string
  name: string
  author: string
  price: number
  stock: number
  image: string
  category: "libro" | "revista" | "toolkit"
  subCategory?: "energia" | "alimentacion" | "meditacion" | "negocio"
  description: string
  pdfUrl?: string // Para libros y revistas
  sections?: ToolkitSection[] // Para toolkits
  createdAt?: Date
  updatedAt?: Date
  trailerUrl?: string
}
