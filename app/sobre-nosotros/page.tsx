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
    <div className="relative max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black">
      {!isPlaying && (
        <button
          aria-label={`Reproducir video ${title}`}
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 cursor-pointer z-10 hover:bg-opacity-80 transition"
        >
          <Play className="w-16 h-16 text-white" />
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
    <div className="min-h-screen bg-black text-white">
      {/* Historia Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-orange-500 text-sm uppercase tracking-wider mb-4">Historia</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-8">¿Cómo empezó todo?</h1>
          <p className="text-gray-300 max-w-4xl mx-auto leading-relaxed">
            Crecí en Zaim, un pequeño pueblo de Moldavia marcado por la pobreza. Desde niño conocí el hambre, pero también el valor de una idea. Siendo muy pequeño comencé vendiendo chicles, y descubrí mi pasión por emprender.
            Con el tiempo, lancé más de 200 proyectos. No todos fueron exitosos, pero cada intento fue una lección. Aprendí que emprender requiere{" "}
            <span className="text-white font-semibold">coraje, constancia y una visión inquebrantable</span>.
          </p>
        </div>

        {/* Vimeo video con botón Play */}
        <VimeoPlayer videoId="1093363512" title="Video Historia" />
      </section>

      {/* Sección con texto y animación lado a lado */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-orange-500 text-sm uppercase tracking-wider mb-4">El optimizador es...</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              El investigador de la felicidad y la abundancia
            </h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Mi propósito es acompañar a las personas en el camino hacia una vida más plena, coherente y próspera. A partir de un método propio basado en cuatro pilares fundamentales — negocio, entrenamiento mental, energía y alimentación—, ayudo a quienes me siguen a replantear su forma de vivir, conectar con lo que realmente importa y transformar su talento en una fuente sostenible de bienestar económico y personal.
            </p>
          </div>
          <div className="flex justify-center">
            {/* Animación Lottie */}
            <Player animationData={animacion} loop autoplay style={{ width: 128, height: 128 }} />
          </div>
        </div>

        {/* Segundo Vimeo video con botón Play */}
        <div className="mt-8 max-w-[95vw] mx-auto aspect-video rounded-2xl overflow-hidden shadow-lg">
          <VimeoPlayer videoId="1093363500" title="Video 4 elementos" />
        </div>
      </section>

      {/* Los 4 elementos Section */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Los 4 elementos</h2>

        <div className="relative w-64 h-64 mx-auto">
          {/* Imagen central */}
          <img
            src="/bibliografia/frame.png"
            alt="Central frame"
            className="w-full h-full object-contain rounded-xl"
          />

          {/* Arriba izquierda - Energia */}
          <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 w-40 text-center">
            <p className="font-semibold text-orange-500 text-lg">Energía</p>
            <p className="text-sm text-gray-300 mt-2">
              “El motor que impulsa tus sueños y mueve cada acción hacia la grandeza.”
            </p>
          </div>

          {/* Arriba derecha - Alimentación */}
          <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 w-40 text-center">
            <p className="font-semibold text-green-500 text-lg">Alimentación</p>
            <p className="text-sm text-gray-300 mt-2">
              “Nutre tu cuerpo y mente para que florezca tu verdadero potencial.”
            </p>
          </div>

          {/* Abajo izquierda - Meditación */}
          <div className="absolute bottom-0 left-0 transform -translate-x-1/2 translate-y-1/2 w-40 text-center">
            <p className="font-semibold text-purple-600 text-lg">Meditación</p>
            <p className="text-sm text-gray-300 mt-2">
              “Encuentra la calma interior que te conecta con tu esencia y propósito.”
            </p>
          </div>

          {/* Abajo derecha - Negocio */}
          <div className="absolute bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 w-40 text-center">
            <p className="font-semibold text-blue-500 text-lg">Negocio</p>
            <p className="text-sm text-gray-300 mt-2">
              “Construye con visión y pasión un legado que trascienda el tiempo.”
            </p>
          </div>
        </div>
      </section>

      {/* Book Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-12 border border-gray-600 rounded-lg p-8 bg-black bg-opacity-80">
          {/* Imagen del libro dentro del recuadro */}
          <div className="flex-shrink-0">
            <img
              src="/bibliografia/lIBRO DON NICO PORTADA40001somra.jpg"
              alt="Portada libro Empleado Rico Jefe Pobre"
              className="w-40 h-auto rounded-lg shadow-lg"
            />
          </div>

          {/* Texto a la derecha, centrado verticalmente dentro del recuadro */}
          <div className="flex flex-col justify-center max-w-xl">
            <p className="text-gray-400 text-sm mb-2">Libro</p>
            <h3 className="text-3xl font-bold mb-4 text-white">Empleado Rico, Jefe Pobre</h3>
            <p className="text-gray-300 leading-relaxed">
              “El verdadero poder no está en ganar dinero, sino en saber cómo mantenerlo y hacerlo crecer. Aprende a cambiar tu mentalidad para alcanzar la libertad financiera y transformar tu vida.”
            </p>
          </div>
        </div>
      </section>

      {/* Signature Section */}
      <section className="py-16 px-4 max-w-4xl mx-auto text-center">
        <div className="mb-8 w-80 h-32 mx-auto">
          <Lottie animationData={firmaAnim} loop={true} />
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
