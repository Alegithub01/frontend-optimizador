import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function AliadosPage() {
  const aliados = [
    {
      id: 1,
      name: "Prati",
      description:
        "Cadena de tiendas especializadas en productos de tratamiento y cuidado dermatológico, dermocosmético y maquillaje; así como productos de nutrición.",
      banner: "/prati-banner.jpg",
      logo: "/prati-logo.png",
    },
    {
      id: 2,
      name: "BioDigest",
      description:
        "Cadena de tiendas especializadas en productos de tratamiento y cuidado dermatológico, dermocosmético y maquillaje; así como productos de nutrición.",
      banner: "/biodigest-banner.jpg",
      logo: "/biodigest-logo.png",
    },
    {
      id: 3,
      name: "BioDigest",
      description:
        "Cadena de tiendas especializadas en productos de tratamiento y cuidado dermatológico, dermocosmético y maquillaje; así como productos de nutrición.",
      banner: "/biodigest-banner.jpg",
      logo: "/biodigest-logo.png",
    },
  ]

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        <div className="text-center mb-16">
          <h2 className="text-lg font-medium text-orange-500">Todos los</h2>
          <h1 className="text-5xl md:text-6xl font-black">ALIADOS</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {aliados.map((aliado) => (
            <div key={aliado.id} className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200">
              {/* Banner Image */}
              <div className="relative h-48">
                <Image src={aliado.banner || "/placeholder.svg"} alt={aliado.name} fill className="object-cover" />
              </div>

              {/* Logo */}
              <div className="flex justify-center -mt-8 mb-4">
                <div className="relative w-24 h-24 bg-white rounded-full p-2 shadow-md">
                  <Image
                    src={aliado.logo || "/placeholder.svg"}
                    alt={`${aliado.name} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="px-6 pb-6 text-center">
                <p className="text-gray-700 mb-6">{aliado.description}</p>

                <Link href={`/aliados/${aliado.id}`}>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-full inline-flex items-center">
                    Ver mas <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
