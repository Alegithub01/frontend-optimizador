"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import Player from "lottie-react";
import animacion from "../../public/bibliografia/animaciones/4elementos.json";
import firmaAnim from "../../public/bibliografia/animaciones/Firma.json";
import Lottie from "lottie-react";

type VimeoPlayerProps = {
  videoId: string;
  title: string;
};

const VimeoPlayer = ({ videoId, title }: VimeoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => setIsPlaying(true);

  return (
    <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
      {!isPlaying && (
        <button
          aria-label={`Reproducir video ${title}`}
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 cursor-pointer z-10 hover:bg-opacity-80 transition"
        >
          <Play className="w-12 h-12 sm:w-16 sm:h-16 text-white" />
        </button>
      )}
      {isPlaying && (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?autoplay=1`}
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
          title={title}
        ></iframe>
      )}
    </div>
  );
};

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Historia Section */}
      <section className="py-8 sm:py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-orange-500 text-sm uppercase tracking-wider mb-4">Historia</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 px-2">¿Cómo empezó todo?</h1>
          <p className="text-gray-300 max-w-4xl mx-auto leading-relaxed text-sm sm:text-base px-2">
            Crecí en Zaim, un pequeño pueblo de Moldavia marcado por la pobreza. Desde niño conocí el hambre, pero también el valor de una idea. Siendo muy pequeño comencé vendiendo chicles, y descubrí mi pasión por emprender.
            Con el tiempo, lancé más de 200 proyectos. No todos fueron exitosos, pero cada intento fue una lección. Aprendí que emprender requiere{" "}
            <span className="text-white font-semibold">coraje, constancia y una visión inquebrantable</span>.
          </p>
        </div>

        {/* Vimeo video con botón Play */}
        <div className="w-full px-2">
          <VimeoPlayer videoId="1093363512" title="Video Historia" />
        </div>
      </section>

      {/* Sección con texto y animación lado a lado */}
      <section className="py-8 sm:py-16 px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="order-2 md:order-1">
            <p className="text-orange-500 text-sm uppercase tracking-wider mb-4">El optimizador es...</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              El investigador de la felicidad y la abundancia
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">
              Mi propósito es acompañar a las personas en el camino hacia una vida más plena, coherente y próspera. A partir de un método propio basado en cuatro pilares fundamentales — negocio, entrenamiento mental, energía y alimentación—, ayudo a quienes me siguen a replantear su forma de vivir, conectar con lo que realmente importa y transformar su talento en una fuente sostenible de bienestar económico y personal.
            </p>
          </div>
          <div className="flex justify-center order-1 md:order-2">
            {/* Animación Lottie responsiva */}
            <div className="w-full max-w-sm sm:max-w-md">
              <Player 
                animationData={animacion} 
                loop 
                autoplay 
                style={{ width: '100%', height: 'auto', maxWidth: '400px' }} 
              />
            </div>
          </div>
        </div>

        {/* Segundo Vimeo video con botón Play */}
        <div className="mt-8 w-full px-2">
          <VimeoPlayer videoId="1093363500" title="Video 4 elementos" />
        </div>
      </section>

      {/* Los 4 elementos Section */}
      <section className="py-8 sm:py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12 px-2">Los 4 elementos</h2>

        {/* Versión móvil - stack vertical */}
        <div className="block md:hidden space-y-8">
          <div className="text-center">
            <p className="font-semibold text-orange-500 text-lg mb-2">Energía</p>
            <p className="text-gray-300 text-sm px-4">
              "El motor que impulsa tus sueños y mueve cada acción hacia la grandeza."
            </p>
          </div>
          
          <div className="text-center">
            <p className="font-semibold text-green-500 text-lg mb-2">Alimentación</p>
            <p className="text-gray-300 text-sm px-4">
              "Nutre tu cuerpo y mente para que florezca tu verdadero potencial."
            </p>
          </div>

          <div className="flex justify-center items-center px-4">
            <img
              src="/bibliografia/Frame.png"
              alt="Central frame"
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
            />
          </div>

          <div className="text-center">
            <p className="font-semibold text-purple-600 text-lg mb-2">Meditación</p>
            <p className="text-gray-300 text-sm px-4">
              "Encuentra la calma interior que te conecta con tu esencia y propósito."
            </p>
          </div>

          <div className="text-center">
            <p className="font-semibold text-blue-500 text-lg mb-2">Negocio</p>
            <p className="text-gray-300 text-sm px-4">
              "Construye con visión y pasión un legado que trascienda el tiempo."
            </p>
          </div>
        </div>

        {/* Versión desktop - grid */}
        <div className="hidden md:grid grid-cols-3 grid-rows-3 gap-4 items-center justify-center max-w-5xl mx-auto text-sm">
          
          {/* Arriba izquierda - Energía */}
          <div className="text-right pr-4">
            <p className="font-semibold text-orange-500 text-lg">Energía</p>
            <p className="text-gray-300 mt-2">
              "El motor que impulsa tus sueños y mueve cada acción hacia la grandeza."
            </p>
          </div>

          {/* Espacio arriba centro */}
          <div></div>

          {/* Arriba derecha - Alimentación */}
          <div className="text-left pl-4">
            <p className="font-semibold text-green-500 text-lg">Alimentación</p>
            <p className="text-gray-300 mt-2">
              "Nutre tu cuerpo y mente para que florezca tu verdadero potencial."
            </p>
          </div>

          {/* Espacio medio izquierda */}
          <div></div>

          {/* Imagen central */}
          <div className="flex justify-center items-center">
            <img
              src="/bibliografia/Frame.png"
              alt="Central frame"
              className="w-64 h-64 object-contain rounded-xl"
            />
          </div>

          {/* Espacio medio derecha */}
          <div></div>

          {/* Abajo izquierda - Meditación */}
          <div className="text-right pr-4">
            <p className="font-semibold text-purple-600 text-lg">Meditación</p>
            <p className="text-gray-300 mt-2">
              "Encuentra la calma interior que te conecta con tu esencia y propósito."
            </p>
          </div>

          {/* Espacio abajo centro */}
          <div></div>

          {/* Abajo derecha - Negocio */}
          <div className="text-left pl-4">
            <p className="font-semibold text-blue-500 text-lg">Negocio</p>
            <p className="text-gray-300 mt-2">
              "Construye con visión y pasión un legado que trascienda el tiempo."
            </p>
          </div>
        </div>
      </section>

      {/* Book Section */}
      <section className="py-8 sm:py-12 px-4 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-12 border border-gray-600 rounded-lg p-4 sm:p-8 bg-black bg-opacity-80">
          {/* Imagen del libro */}
          <div className="flex-shrink-0">
            <img
              src="/bibliografia/libro.png"
              alt="Portada libro Empleado Rico Jefe Pobre"
              className="w-32 sm:w-40 h-auto rounded-lg shadow-lg mx-auto"
            />
          </div>

          {/* Texto */}
          <div className="flex flex-col justify-center text-center sm:text-left">
            <p className="text-gray-400 text-sm mb-2">Libro</p>
            <h3 className="text-2xl sm:text-3xl font-bold mb-4 text-white">Empleado Rico, Jefe Pobre</h3>
            <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
              El verdadero poder no está en ganar dinero, sino en saber cómo mantenerlo y hacerlo crecer. Aprende a cambiar tu mentalidad para alcanzar la libertad financiera y transformar tu vida.
            </p>
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-8 sm:py-16 px-4 max-w-4xl mx-auto text-center pb-24 sm:pb-48">
        <div className="mb-8 sm:mb-12 w-64 sm:w-80 h-24 sm:h-32 mx-auto">
          <Lottie animationData={firmaAnim} loop={true} />
        </div>
      </section>

    </div>
  );
};

export default AboutUs;