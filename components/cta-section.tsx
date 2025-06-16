import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Image from "next/image"

export default function CTASection() {
  return (
    <section className="container mx-auto py-12 md:py-16 px-4">
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
        {/* Columna izquierda - CTA */}
        <div className="bg-gray-100 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-12 flex-1">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black mb-4 md:mb-6 max-w-md leading-tight">
            OPTIMIZA TU VIDA Y ALCANZA LO QUE TE PROPONES
          </h2>

          <p className="text-gray-700 mb-6 md:mb-8 max-w-md">
            Agenda tu mentoría para llevar tu empresa al siguiente nivel
          </p>

          <Link
            href="/"
            className="inline-flex items-center bg-orange-700 hover:bg-orange-500 text-black font-medium py-3 px-6 rounded-full transition-colors"
          >
            ¡Reserva tu mentoría hoy!
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Columna derecha - Estadísticas */}
        <div className="flex flex-col gap-3 md:gap-4 lg:w-1/3">
          {/* Estadística 1 */}
          <div className="bg-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-black text-black">+300</div>
              <div className="text-gray-600 text-sm">Empresas</div>
            </div>
            <div className="text-gray-400">
              <Image src="/trending-up-sharp.svg" alt="Gráfico" width={32} height={32} className="md:w-10 md:h-10" />
            </div>
          </div>

          {/* Estadística 2 */}
          <div className="bg-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-black text-black">+10</div>
              <div className="text-gray-600 text-sm">Resultados</div>
            </div>
            <div className="text-gray-400">
              <Image src="/bar-chart-outline.svg" alt="Gráfico" width={32} height={32} className="md:w-10 md:h-10" />
            </div>
          </div>

          {/* Estadística 3 */}
          <div className="bg-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-6 flex items-center justify-between">
            <div>
              <div className="text-2xl md:text-3xl font-black text-black">+5</div>
              <div className="text-gray-600 text-sm">Premios</div>
            </div>
            <div className="text-gray-400">
              <Image src="/trophy-outline.svg" alt="Gráfico" width={32} height={32} className="md:w-10 md:h-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
