import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"

interface Product {
  id: number
  title: string
  description: string
  category: string
  price: number
  image: string
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const categoryColors: Record<string, string> = {
    Energía: "bg-orange-500",
    Alimentación: "bg-green-500",
    Meditación: "bg-purple-500",
    Negocio: "bg-blue-500",
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-all">
      <div className="relative h-36 md:h-48">
        <Image src={product.image || "/placeholder.svg"} alt={product.title} fill className="object-cover" />
        <div
          className={`absolute top-2 md:top-4 left-2 md:left-4 ${categoryColors[product.category]} px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium`}
        >
          {product.category}
        </div>
      </div>

      <div className="p-3 md:p-6">
        <h3 className="text-base md:text-xl font-bold mb-1 md:mb-2">{product.title}</h3>
        <p className="text-gray-400 text-xs md:text-base mb-2 md:mb-4 line-clamp-2 md:line-clamp-none">
          {product.description}
        </p>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
          <span className="text-xl md:text-2xl font-bold">${product.price}</span>
          <div className="flex gap-2 w-full md:w-auto">
            <Link href={`/productos/${product.id}`} className="flex-1 md:flex-auto">
              <Button
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 w-full md:w-auto text-xs md:text-sm"
              >
                Ver Detalles
              </Button>
            </Link>
            <Button className="bg-orange-700 hover:bg-orange-600 text-white aspect-square md:aspect-auto">
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
