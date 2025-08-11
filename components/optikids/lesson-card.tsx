"use client"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Camera, PlayCircle } from "lucide-react"
import type { Lesson } from "@/types/optikids"
import { getTranslation } from "@/lib/translations"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

interface LessonCardProps {
  lesson: Lesson
  gradientClass: string
  countryCode: string
  optikidsId: string // Added optikidsId prop
}

export function LessonCard({ lesson, gradientClass, countryCode, optikidsId }: LessonCardProps) {
  const imageSizeMobile = 200 // Tamaño de la imagen para el posicionamiento en px en móvil
  const imageSizeDesktop = 300 // Tamaño de la imagen para el posicionamiento en px en desktop
  const MOBILE_TOP_CUSHION = 12 // menor = más pegado, mayor = más separación

  const normalizePublicPath = (url?: string) => {
    if (!url) return undefined
    return url.startsWith("/") ? url : `/${url}`
  }

  const fixCommonTypos = (url?: string) => {
    if (!url) return undefined
    // Corrige el typo más común en la carpeta
    return url.replace("/optikids/descartgable/", "/optikids/descargable/")
  }

  const ensureDownloadPath = (url?: string) => normalizePublicPath(fixCommonTypos(url))

  const androidHref = lesson.urlAndroid
  const iosHref = lesson.urlIos

  const cacheBuster = useMemo(() => Date.now().toString(), [])
  const withBuster = (url?: string) => (url ? `${url}${url.includes("?") ? "&" : "?"}v=${cacheBuster}` : undefined)

  const androidDownloadHref = withBuster(androidHref)
  const iosDownloadHref = withBuster(iosHref)

  // Calculamos los valores directamente (basados en tamaño móvil)
  const marginTopForCard = imageSizeMobile / 3 // 1/3 de la imagen sobresale
  // Ahora: lo mínimo para esquivar la imagen dentro de la tarjeta + 8px de colchón
  const paddingTopForContent = Math.max(0, imageSizeMobile - marginTopForCard - MOBILE_TOP_CUSHION - 50)

  console.log("LessonCard - optikidsId prop:", optikidsId, "lesson.id:", lesson.id) // Debugging

  return (
    // Contenedor principal para la tarjeta y la imagen que sobresale
    <div className="relative mx-auto w-full max-w-[389px] md:max-w-[957px]">
      {/* Imagen móvil que sobresale: posicionada absolutamente sobre el contenedor principal */}
      {lesson.urlImage && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 md:hidden z-10"
          style={{
            transform: `translateX(-50%) translateY(-${marginTopForCard}px)`, // Ajuste para que 1/3 sobresalga
            width: `${imageSizeMobile}px`,
            height: `${imageSizeMobile}px`,
          }}
        >
          <Image
            src={lesson.urlImage || "/placeholder.svg"}
            alt="Lesson illustration"
            width={imageSizeMobile}
            height={imageSizeMobile}
            className="object-contain"
          />
        </div>
      )}

      {/* La tarjeta de la lección: ahora crece con el contenido */}
      <div
        className={cn(
          "relative rounded-3xl shadow-lg overflow-hidden",
          !lesson.urlBg && gradientClass, // Aplica el gradiente solo si no hay urlBg
          "w-full",
          // Alturas mínimas por defecto, pero permitiendo crecimiento
          "min-h-[328px] md:min-h-[280px]",
          "flex flex-col md:flex-row items-center md:items-stretch",
          "md:mt-0", // Resetea el margin-top en escritorio
        )}
        style={{
          // Empuja la tarjeta hacia abajo en móvil para dejar espacio a la imagen que sobresale
          marginTop: marginTopForCard,
          ...(lesson.urlBg
            ? {
                backgroundImage: `url(${lesson.urlBg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : {}),
        }}
      >
        {/* Área de contenido */}
        <div className="relative z-20 flex flex-col flex-1 px-4 pb-4 md:p-8 text-white md:text-left">
          {/* Contenido para móvil: centrado y con padding superior para evitar la imagen */}
          <div
            className="md:hidden flex flex-col items-center text-center"
            style={{ paddingTop: `${paddingTopForContent}px` }}
          >
            <span className="text-sm font-semibold bg-black/30 px-2 py-1 rounded-full mb-1 md:mb-2">
              {lesson.etiqueta}
            </span>
            <h2 className="text-xl font-bold mb-2 break-words hyphens-auto leading-tight">{lesson.titulo}</h2>
            <p className="text-sm mb-4 break-words hyphens-auto">{lesson.descripcion}</p>

            <div className="flex flex-nowrap justify-center gap-1 overflow-x-auto pb-2">
              {/* Botón de Descargar Android (móvil) */}
              {androidDownloadHref && (
                <a href={androidDownloadHref} download>
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}{" "}
                    <Image src="/optikids/android.svg" alt="Android" width={16} height={16} className="w-5 h-5" />
                  </Button>
                </a>
              )}

              {/* Botón de Descargar iOS (móvil) */}
              {iosDownloadHref && (
                <a href={iosDownloadHref} download>
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}{" "}
                    <Image src="/optikids/apple.svg" alt="IOS" width={16} height={16} className="w-6 h-6" />
                  </Button>
                </a>
              )}

              {/* Botón de Cámara */}
              {lesson.urlSnap && (
                <Link href={lesson.urlSnap} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "camara")} <Camera className="w-4 h-4 text-gray-8" />
                  </Button>
                </Link>
              )}

              {/* Botón de Video */}
              {lesson.urlVideo && (
                <Link href={`/optikids/${optikidsId}/tutorial?lessonId=${lesson.id}`} passHref>
                  <Button
                    variant="secondary"
                    className="gap-1 px-1 h-8 text-xs flex-shrink-0 bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "video")} <PlayCircle className="w-4 h-4 text-gray-8" />
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Contenido para escritorio: alineado a la izquierda y puede envolver */}
          <div className="hidden md:flex md:flex-col md:justify-center md:w-2/3">
            <span className="text-sm font-semibold bg-black/30 px-2 py-1 rounded-full self-start mb-2">
              {lesson.etiqueta}
            </span>
            <h2 className="text-2xl font-bold mb-2 break-words hyphens-auto leading-tight">{lesson.titulo}</h2>
            <p className="text-base mb-4 break-words hyphens-auto">{lesson.descripcion}</p>

            <div className="flex md:flex-nowrap flex-wrap gap-2">
              {/* Descargar Android (escritorio) */}
              {androidDownloadHref && (
                <a href={androidDownloadHref} download>
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 md:shrink-0 whitespace-nowrap bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}
                    <Image src="/optikids/android.svg" alt="Android" width={16} height={16} className="w-5 h-5" />
                  </Button>
                </a>
              )}

              {/* Descargar iOS (escritorio) */}
              {iosDownloadHref && (
                <a href={iosDownloadHref} download>
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 md:shrink-0 whitespace-nowrap bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "descargar")}{" "}
                    <Image src="/optikids/apple.svg" alt="Ios" width={16} height={16} className="w-6 h-6" />
                  </Button>
                </a>
              )}

              {lesson.urlSnap && (
                <Link href={lesson.urlSnap} target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 md:shrink-0 whitespace-nowrap bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "camara")} <Camera className="w-4 h-4 text-gray-8" />
                  </Button>
                </Link>
              )}

              {lesson.urlVideo && (
                <Link href={`/optikids/${optikidsId}/tutorial?lessonId=${lesson.id}`} passHref>
                  <Button
                    variant="secondary"
                    className="gap-1 md:h-8 md:shrink-0 whitespace-nowrap bg-white text-gray-8 rounded-xl"
                  >
                    {getTranslation(countryCode, "video")} <PlayCircle className="w-4 h-4 text-gray-8" />
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
              width={imageSizeDesktop}
              height={imageSizeDesktop}
              className="object-contain"
            />
          </div>
        )}
      </div>
    </div>
  )
}
