import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-black text-white py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* Columna izquierda - Logo y tagline */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4 md:mb-6">
              <div className="text-orange-700">
                <img src="/logo.svg" alt="logo" className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">Optimizador</span>
            </div>

            <h3 className="text-xl md:text-2xl font-medium leading-tight mb-4 md:mb-6">
              Encuentra la <br />
              felicidad y la <br />
              abundancia
            </h3>
          </div>

          {/* Columnas móvil - Redes y Contacto en fila */}
          <div className="md:hidden grid grid-cols-2 gap-4">
            {/* Redes sociales - Izquierda en móvil */}
            <div className="flex flex-col items-start">
              <h4 className="text-sm font-medium mb-4 whitespace-nowrap">Únete a la comunidad</h4>

              <div className="flex gap-3 flex-wrap">
                <Link
                  href="https://www.facebook.com/people/El-Optimizador/100070661362321/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/Fcebook.svg" alt="Facebook" className="h-5 w-5" />
                </Link>

                <Link
                  href="https://www.instagram.com/el.optimizador/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/IG.svg" alt="Instagram" className="h-5 w-5" />
                </Link>

                <Link
                  href="https://www.tiktok.com/@el.optimizador"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/Tiktok.svg" alt="tiktok" className="h-5 w-5" />
                </Link>

                <Link
                  href="https://www.youtube.com/@ElOptimizadorBo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/youtube.svg" alt="youtube" className="h-5 w-5" />
                </Link>

                <Link
                  href="https://www.linkedin.com/in/nicolaegrosu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/LinkedIn.svg" alt="linkedin" className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Contacto - Derecha en móvil */}
            <div className="flex flex-col items-end">
              <h4 className="text-sm font-medium mb-4">Contacto</h4>

              <div className="flex gap-3">
                <Link
                  href="mailto:optimizador@gmail.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/Gmail.svg" alt="gmail" className="h-5 w-5" />
                </Link>

                <Link
                  href="tel:+59177419374"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/Whatsapp.svg" alt="whatsapp" className="h-5 w-5" />
                </Link>

                <Link
                  href="tel:77419374"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <img src="/llamada.svg" alt="phone" className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Sobre Nosotros - Centrado en móvil */}
          <div className="md:hidden flex flex-col items-center mt-6">
            <Link href="/sobre-nosotros" className="text-orange-700 hover:text-orange-400 transition-colors">
              <img src="/logo-plomo.svg" alt="Star" className="h-6 w-6" />
            </Link>

            <Link href="/sobre-nosotros" className="text-gray-400 hover:text-white transition-colors text-sm mt-2">
              Sobre Nosotros
            </Link>
          </div>

          {/* Columna central - Contacto (solo desktop) */}
          <div className="hidden md:flex flex-col items-center">
            <h4 className="text-lg font-medium mb-4 md:mb-6">Contacto</h4>

            <div className="space-y-3 md:space-y-4">
              <Link
                href="mailto:optimizador@gmail.com"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <img src="/Gmail.svg" alt="gmail" className="h-5 w-5" />
                <span className="text-sm md:text-base">optimizador@gmail.com</span>
              </Link>

              <Link
                href="tel:+59177419374"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <img src="/Whatsapp.svg" alt="whatsapp" className="h-5 w-5" />
                <span className="text-sm md:text-base">+591 77419374</span>
              </Link>

              <Link
                href="tel:77419374"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <img src="/llamada.svg" alt="phone" className="h-5 w-5" />
                <span className="text-sm md:text-base">77419374</span>
              </Link>
            </div>

            <div className="mt-6 md:mt-8 flex flex-col items-center gap-2">
              <Link href="/sobre-nosotros" className="text-orange-700 hover:text-orange-400 transition-colors">
                <img src="/logo-plomo.svg" alt="Star" className="h-6 w-6" />
              </Link>

              <Link
                href="/sobre-nosotros"
                className="text-gray-400 hover:text-white transition-colors text-sm md:text-base"
              >
                Sobre Nosotros
              </Link>
            </div>
          </div>

          {/* Columna derecha - Redes sociales (solo desktop) */}
          <div className="hidden md:flex flex-col items-center md:items-end">
            <h4 className="text-lg font-medium mb-4 md:mb-6">Únete a la comunidad</h4>

            <div className="space-y-3 md:space-y-4">
              <Link
                href="https://www.facebook.com/people/El-Optimizador/100070661362321/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-sm md:text-base">El Optimizador</span>
                <img src="/Fcebook.svg" alt="Facebook" className="h-5 w-5" />
              </Link>

              <Link
                href="https://www.instagram.com/el.optimizador/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-sm md:text-base">eloptimizador</span>
                <img src="/IG.svg" alt="Instagram" className="h-5 w-5" />
              </Link>

              <Link
                href="https://www.tiktok.com/@el.optimizador"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-sm md:text-base">eloptimizador</span>
                <img src="/Tiktok.svg" alt="tiktok" className="h-5 w-5" />
              </Link>

              <Link
                href="https://www.youtube.com/@ElOptimizadorBo"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-sm md:text-base">El Optimizador</span>
                <img src="/youtube.svg" alt="youtube" className="h-5 w-5" />
              </Link>

              <Link
                href="https://www.linkedin.com/in/nicolaegrosu/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <span className="text-sm md:text-base">Nicolae Grosu</span>
                <img src="/LinkedIn.svg" alt="linkedin" className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-gray-400 text-sm">© 2025. Derechos Reservados "Optimizador".</p>
        </div>
      </div>
    </footer>
  )
}
