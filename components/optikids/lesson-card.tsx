"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Camera,
  PlayCircle,
} from "lucide-react";
import type { Lesson } from "@/types/optikids";
import { getTranslation } from "@/lib/translations";
import { cn } from "@/lib/utils";

interface LessonCardProps {
  lesson: Lesson;
  gradientClass: string;
  countryCode: string;
  optikidsId: string; // Added optikidsId prop
}

export function LessonCard({
  lesson,
  gradientClass,
  countryCode,
  optikidsId,
}: LessonCardProps) {
  const imageSizeMobile = 200; // Tamaño de la imagen para el posicionamiento en px en móvil
  const imageSizeDesktop = 300; // Tamaño de la imagen para el posicionamiento en px en desktop

  // Calculamos los valores directamente para Tailwind (basados en tamaño móvil)
  const marginTopForCard = imageSizeMobile / 3; // 1/3 de la imagen sobresale
  const paddingTopForContent = (imageSizeMobile * 2) / 3 + 16; // 2/3 de la imagen + 1rem (16px) de padding

  console.log(
    "LessonCard - optikidsId prop:",
    optikidsId,
    "lesson.id:",
    lesson.id
  ); // Debugging

  return (
    // Contenedor principal para la tarjeta y la imagen que sobresale
    <div className="relative mx-auto w-full max-w-[389px] md:max-w-[957px]">
      {/* Imagen móvil que sobresale: posicionada absolutamente sobre el contenedor principal */}
      {lesson.urlImage && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 md:hidden z-10"
          style={{
            transform: `translateX(-50%) translateY(-${marginTopForCard}px)`, // Ajuste para que 1/3 sobresalga
            width: `${imageSizeMobile}px`, // Usar tamaño móvil
            height: `${imageSizeMobile}px`, // Usar tamaño móvil
          }}
        >
          <Image
            src={lesson.urlImage || "/placeholder.svg"}
            alt="Lesson illustration"
            width={imageSizeMobile} // Tamaño por defecto para móvil
            height={imageSizeMobile} // Tamaño por defecto para móvil
            className="object-contain"
          />
        </div>
      )}

      {/* La tarjeta de la lección: tiene un margen superior para dejar espacio a la imagen que sobresale */}
      <div
        className={cn(
          "relative rounded-3xl shadow-lg overflow-hidden", // overflow-hidden para los bordes redondeados de la tarjeta
          !lesson.urlBg && gradientClass, // Aplica el gradiente solo si no hay urlBg
          "w-full h-[328px] md:h-[280px]", // Dimensiones para móvil y escritorio (altura reducida en desktop)
          "flex flex-col md:flex-row items-center md:items-stretch",
          `mt-[${marginTopForCard}px] md:mt-0` // Empuja la tarjeta hacia abajo en móvil
        )}
        style={
          lesson.urlBg
            ? {
                backgroundImage: `url(${lesson.urlBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}
        }
      >
        {/* Área de contenido */}
        <div className="relative z-20 flex flex-col flex-1 p-4 md:p-8 text-white md:text-left">
          {/* Contenido para móvil: centrado y con padding superior para evitar la imagen */}
          <div
            className="md:hidden flex flex-col items-center text-center"
            style={{ paddingTop: `${paddingTopForContent}px` }}
          >
            <span className="text-sm font-semibold bg-black/30 px-2 py-1 rounded-full mb-2">
              {lesson.etiqueta}
            </span>
            <h2 className="text-xl font-bold mb-2">{lesson.titulo}</h2>
            <p className="text-sm mb-4">{lesson.descripcion}</p>
            <div className="flex flex-nowrap justify-center gap-1 overflow-x-auto pb-2">
              {/* Botón de Descargar Android */}
              {lesson.urlAndroid && (
                <Link
                  href={lesson.urlAndroid}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}{" "}
                    <Image
                      src="/optikids/android.svg"
                      alt="Android"
                      width={16}
                      height={16}
                      className="w-5 h-5" // igual que el ícono anterior
                    />
                  </Button>
                </Link>
              )}
              {/* Botón de Descargar iOS */}
              {lesson.urlIos && (
                <Link
                  href={lesson.urlIos}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}{" "}
                    <Image
                      src="/optikids/apple.svg"
                      alt="IOS"
                      width={16}
                      height={16}
                      className="w-6 h-6" // igual que el ícono anterior
                    />
                  </Button>
                </Link>
              )}
              {/* Botón de Cámara */}
              {lesson.urlSnap && (
                <Link
                  href={lesson.urlSnap}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "camara")}{" "}
                    <Camera className="w-4 h-4 text-gray-8" />
                  </Button>
                </Link>
              )}
              {/* Botón de Video */}
              {lesson.urlVideo && (
                <Link
                  href={`/optikids/${optikidsId}/tutorial?lessonId=${lesson.id}`}
                  passHref
                >
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "video")}{" "}
                    <PlayCircle className="w-4 h-4 text-gray-8" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Contenido para escritorio: alineado a la izquierda */}
          <div className="hidden md:flex md:flex-col md:justify-center md:h-full md:w-2/3">
            <span className="text-sm font-semibold bg-black/30 px-2 py-1 rounded-full self-start mb-2">
              {lesson.etiqueta}
            </span>
            <h2 className="text-2xl font-bold mb-2">{lesson.titulo}</h2>
            <p className="text-base mb-4">{lesson.descripcion}</p>
            <div className="flex flex-nowrap gap-2">
              {lesson.urlAndroid && (
                <Link
                  href={lesson.urlAndroid}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}
                    <Image
                      src="/optikids/android.svg"
                      alt="Android"
                      width={16}
                      height={16}
                      className="w-5 h-5" // igual que el ícono anterior
                    />
                  </Button>
                </Link>
              )}
              {lesson.urlIos && (
                <Link
                  href={lesson.urlIos}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}{" "}
                    <Image
                      src="/optikids/apple.svg"
                      alt="Ios"
                      width={16}
                      height={16}
                      className="w-6 h-6" // igual que el ícono anterior
                    />
                  </Button>
                </Link>
              )}
              {lesson.urlSnap && (
                <Link
                  href={lesson.urlSnap}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "camara")}{" "}
                    <Camera className="w-4 h-4 text-gray-8" />
                  </Button>
                </Link>
              )}
              {lesson.urlVideo && (
                <Link
                  href={`/optikids/${optikidsId}/tutorial?lessonId=${lesson.id}`}
                  passHref
                >
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "video")}{" "}
                    <PlayCircle className="w-4 h-4 text-gray-8" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Imagen para escritorio */}
        {lesson.urlImage && (
          <div className="hidden md:flex md:w-1/3 md:justify-center md:items-center md:p-4">
            <Image
              src={lesson.urlImage || "/placeholder.svg"}
              alt="Lesson illustration"
              width={imageSizeDesktop} // Tamaño para desktop
              height={imageSizeDesktop} // Tamaño para desktop
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
}
