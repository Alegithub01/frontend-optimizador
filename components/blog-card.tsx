import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  date: string
  author: string
  image: string
}

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md">
      <div className="relative h-48">
        <Image
          src={post.image || "/placeholder.svg?height=300&width=400"}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{post.title}</h3>

        <div className="flex items-center text-gray-500 text-sm mb-4">
          <span>{post.date}</span>
          <span className="mx-2">|</span>
          <span>{post.author}</span>
        </div>

        <p className="text-gray-600 mb-4">{post.excerpt}</p>

        <Link href={`/blog/${post.id}`}>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2 text-sm">
            Ver mas &gt;
          </Button>
        </Link>
      </div>
    </div>
  )
}
