import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface ProductCategory {
  id: number
  title: string
  image: string
  href: string
}

interface ProductCategoryCardProps {
  category: ProductCategory
}

export default function ProductCategoryCard({ category }: ProductCategoryCardProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full h-32 md:h-64 mb-2 md:mb-4 transition-transform duration-300 hover:scale-105">
        <Image
          src={category.image || "/placeholder.svg?height=300&width=200"}
          alt={category.title}
          fill
          className="object-contain"
        />
      </div>

      <h3 className="text-sm md:text-xl text-black font-bold mb-2 md:mb-4 text-center">{category.title}</h3>

      <Link href={category.href}>
        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-orange-700 flex items-center justify-center hover:bg-orange-600 transition-colors">
          <ArrowRight className="h-3 w-3 md:h-5 md:w-5 text-white" />
        </div>
      </Link>
    </div>
  )
}
