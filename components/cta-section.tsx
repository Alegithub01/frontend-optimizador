import Link from "next/link"
import { ArrowRightCircle } from "lucide-react"
import Image from "next/image"

export default function CTASection() {
  return (
    <section className="container py-12 md:py-16 px-4">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full max-w-6xl mx-auto gap-6 md:gap-8 px-4">
        {/* Columna izquierda - CTA */}
        <div className="bg-gray-0 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 lg:w-[72%] xl:w-[75%]">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black mb-4 md:mb-6 max-w-md leading-tight">
            ¿ESTÁS LISTO PARA EL SIGUIENTE NIVEL?
          </h2>
          <p className="text-black mb-6 md:mb-8 max-w-md">
            Resultados reales, estrategias claras y acompañamiento que transforma. Tu crecimiento no es una casualidad,
            es una decisión.
          </p>
          <Link
            href="/"
            className="inline-flex items-center bg-orange-700 hover:bg-orange-500 text-black font-medium py-3 px-6 rounded-full transition-colors"
          >
            Quiero crecer
            <ArrowRightCircle className="ml-2 h-5 w-5" />
          </Link>
        </div>

        {/* Columna derecha - Estadísticas */}
        <div className="flex flex-col gap-3 md:gap-4 lg:w-1/4 min-w-[220px]">
          {/* Estadísticas (sin cambios) */}
          <div className="bg-gray-0 rounded-2xl md:rounded-3xl p-3 md:p-4 flex items-center justify-between max-w-[200px]">
            <div>
              <div className="text-2xl md:text-3xl font-black text-black">+30</div>
              <div className="text-gray-5 text-sm">Empresas</div>
            </div>
            <div className="text-gray-400 ml-2">
              <Image src="/trending-up-sharp.svg" alt="Gráfico" width={48} height={48} className="md:w-14 md:h-14" />
            </div>
          </div>

          <div className="bg-gray-0 rounded-2xl md:rounded-3xl p-3 md:p-4 flex items-center justify-between max-w-[200px]">
            <div>
              <div className="text-2xl md:text-3xl font-black text-black">5 días</div>
              <div className="text-gray-5 text-sm">Resultados</div>
            </div>
            <div className="text-gray-400 ml-2">
              <Image src="/bar-chart-outline.svg" alt="Gráfico" width={48} height={48} className="md:w-14 md:h-14" />
            </div>
          </div>

          <div className="bg-gray-0 rounded-2xl md:rounded-3xl p-3 md:p-4 flex items-center justify-between max-w-[200px]">
            <div>
              <div className="text-2xl md:text-3xl font-black text-black">+100</div>
              <div className="text-gray-5 text-sm">Ideas Innovadoras</div>
            </div>
            <div className="text-gray-400 ml-2">
              <Image src="/trophy-outline.svg" alt="Gráfico" width={48} height={48} className="md:w-14 md:h-14" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* CTA Principal */}
        <div className="bg-gray-0 rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-black text-black mb-3 text-center leading-tight">
            OPTIMIZA TU VIDA Y ALCANZA LO QUE TE PROPONES
          </h2>
          <p className="text-black text-sm mb-6 text-center">
            Agenda tu mentoría para llevar tu empresa al siguiente nivel
          </p>
          <div className="flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center bg-orange-700 hover:bg-orange-500 text-black font-medium py-3 px-6 rounded-full transition-colors"
            >
              Quiero crecer
              <img src="/botones/arrowRigth.svg" alt="Flecha" className="h-6 w-6" />
            </Link>
          </div>
        </div>

        {/* Estadísticas en fila */}
        <div className="grid grid-cols-3 gap-3">
          {/* Estadística 1 */}
          <div className="bg-gray-0 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Image src="/trending-up-sharp.svg" alt="Gráfico" width={80} height={0} className="text-gray-400" />
            </div>
            <div className="text-3xl font-black text-black">+300</div>
            <div className="text-gray-5 text-l">Empresas</div>
          </div>

          {/* Estadística 2 */}
          <div className="bg-gray-0 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Image src="/bar-chart-outline.svg" alt="Gráfico" width={80} height={0} className="text-gray-400" />
            </div>
            <div className="text-3xl font-black text-black">+10</div>
            <div className="text-gray-5 text-l">Resultados</div>
          </div>

          {/* Estadística 3 */}
          <div className="bg-gray-0 rounded-xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <Image src="/trophy-outline.svg" alt="Gráfico" width={80} height={0} className="text-gray-400" />
            </div>
            <div className="text-3xl font-black text-black">+5</div>
            <div className="text-gray-5 text-l">Premios</div>
          </div>
        </div>
      </div>
    </section>
  )
}
