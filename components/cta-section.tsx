import Link from "next/link"
import { ArrowRightCircle } from "lucide-react"
import Image from "next/image"

export default function CTASection() {
  return (
    <section className="w-full py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4">
        {/* Desktop Layout */}
        <div className="hidden lg:flex w-full gap-6 md:gap-8 justify-center">
          {/* Columna izquierda - CTA */}
          <div className="bg-gray-0 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 w-full max-w-3xl">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-black mb-4 md:mb-6 leading-tight">
              ¿ESTÁS LISTO PARA EL SIGUIENTE NIVEL?
            </h2>
            <p className="text-black mb-6 md:mb-8">
              Resultados reales, estrategias claras y acompañamiento que transforma. Tu crecimiento no es una
              casualidad, es una decisión.
            </p>
            <Link
              href="https://docs.google.com/forms/d/e/1FAIpQLSc8YFMvraWhAu1TQ4Q_r4RhOEHsB-IoMfaP9MWRn8hDYaX2Ag/viewform?usp=sharing&ouid=102517721890925250841"
              className="inline-flex items-center bg-orange-700 hover:bg-orange-500 text-black font-medium py-3 px-6 rounded-full transition-colors"
            >
              Quiero crecer
              <ArrowRightCircle className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {/* Columna derecha - Estadísticas */}
          <div className="flex flex-col gap-4 justify-center">
            <div className="bg-gray-0 rounded-2xl p-4 flex items-center justify-between w-[200px]">
              <div>
                <div className="text-2xl font-black text-black">+30</div>
                <div className="text-gray-500 text-sm">Empresas</div>
              </div>
              <Image src="/trending-up-sharp.svg" alt="Gráfico" width={48} height={48} />
            </div>

            <div className="bg-gray-0 rounded-2xl p-4 flex items-center justify-between w-[200px]">
              <div>
                <div className="text-2xl font-black text-black">5 días</div>
                <div className="text-gray-500 text-sm">Resultados</div>
              </div>
              <Image src="/bar-chart-outline.svg" alt="Gráfico" width={48} height={48} />
            </div>

            <div className="bg-gray-0 rounded-2xl p-4 flex items-center justify-between w-[200px]">
              <div>
                <div className="text-2xl font-black text-black">+100</div>
                <div className="text-gray-500 text-sm">Ideas Innovadoras</div>
              </div>
              <Image src="/trophy-outline.svg" alt="Gráfico" width={48} height={48} />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="bg-gray-0 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-black text-black mb-3 text-center leading-tight">
              OPTIMIZA TU VIDA Y ALCANZA LO QUE TE PROPONES
            </h2>
            <p className="text-black text-sm mb-6 text-center">
              Agenda tu mentoría para llevar tu empresa al siguiente nivel
            </p>
            <div className="flex justify-center">
              <Link
                href="https://docs.google.com/forms/d/e/1FAIpQLSc8YFMvraWhAu1TQ4Q_r4RhOEHsB-IoMfaP9MWRn8hDYaX2Ag/viewform?usp=sharing&ouid=102517721890925250841"
                className="inline-flex items-center bg-orange-700 hover:bg-orange-500 text-black font-medium py-3 px-6 rounded-full transition-colors"
              >
                Quiero crecer
                <img src="/botones/arrowRigth.svg" alt="Flecha" className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Estadísticas en fila */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-0 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <Image src="/trending-up-sharp.svg" alt="Gráfico" width={40} height={40} />
              </div>
              <div className="text-3xl font-black text-black">+300</div>
              <div className="text-gray-500 text-sm">Empresas</div>
            </div>

            <div className="bg-gray-0 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <Image src="/bar-chart-outline.svg" alt="Gráfico" width={40} height={40} />
              </div>
              <div className="text-3xl font-black text-black">+10</div>
              <div className="text-gray-500 text-sm">Resultados</div>
            </div>

            <div className="bg-gray-0 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-2">
                <Image src="/trophy-outline.svg" alt="Gráfico" width={40} height={40} />
              </div>
              <div className="text-3xl font-black text-black">+5</div>
              <div className="text-gray-500 text-sm">Premios</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
