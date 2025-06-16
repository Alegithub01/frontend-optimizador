import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Proyecto {
  id: string
  title: string
  image: string
  link: string
  featured?: boolean
}

interface ProyectosSectionProps {
  proyectos: Proyecto[]
}

export default function ProyectosSection({ proyectos }: ProyectosSectionProps) {
  const proyectoDestacado = proyectos.find((proyecto) => proyecto.featured)
  const proyectosRegulares = proyectos.filter((proyecto) => !proyecto.featured)

  return (
    <section className="container mx-auto py-12 md:py-16 px-4">
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-lg font-medium text-orange-700">Categoría</h2>
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-black">PROYECTOS</h3>
      </div>

      {/* Mobile Layout */}
      <div className="block md:hidden space-y-6">
        {/* Proyecto destacado primero en móvil */}
        {proyectoDestacado && <ProyectoCard proyecto={proyectoDestacado} featured />}

        {/* Resto de proyectos */}
        <div className="grid grid-cols-2 gap-4">
          {proyectosRegulares.map((proyecto) => (
            <ProyectoCard key={proyecto.id} proyecto={proyecto} />
          ))}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-[0.7fr_1fr_0.7fr] gap-6 px-4">
          {/* Primera columna (2 proyectos) */}
          <div className="flex flex-col gap-6">
            {proyectosRegulares.slice(0, 2).map((proyecto) => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>

          {/* Columna central (proyecto destacado) */}
          {proyectoDestacado && (
            <div>
              <ProyectoCard proyecto={proyectoDestacado} featured />
            </div>
          )}

          {/* Tercera columna (2 proyectos) */}
          <div className="flex flex-col gap-6">
            {proyectosRegulares.slice(2, 4).map((proyecto) => (
              <ProyectoCard key={proyecto.id} proyecto={proyecto} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProyectoCard({ proyecto, featured = false }: { proyecto: Proyecto; featured?: boolean }) {
  return (
    <Link href={proyecto.link} className="group">
      <div
        className={`relative rounded-2xl md:rounded-3xl overflow-hidden ${
          featured ? "h-[300px] md:h-[400px]" : "h-[150px] md:h-[200px]"
        } transition-transform duration-300 group-hover:scale-[0.98]`}
      >
        <Image
          src={proyecto.image || "/placeholder.svg"}
          alt={proyecto.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>

        {featured && proyecto.title && (
          <div className="absolute top-1/4 left-0 right-0 text-center text-white">
            <div className="text-2xl md:text-4xl font-bold">{proyecto.title}</div>
          </div>
        )}

        <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-orange-700 text-white rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center group-hover:bg-orange-600 transition-colors">
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
