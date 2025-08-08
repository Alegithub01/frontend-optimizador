"use client";

import { useState, useEffect } from "react";
import { LessonCard } from "@/components/optikids/lesson-card";
import type { Lesson, Optikids } from "@/types/optikids"; // Import Optikids type
import { api } from "@/lib/api";
import Image from "next/image"; // Import Image
import { getTranslation } from "@/lib/translations"; // Import getTranslation

const gradientClasses = [
  "bg-gradient-to-r from-[#007bff] to-[#00c6ff]",
  "bg-gradient-to-r from-[#28a745] to-[#20c997]",
  "bg-gradient-to-r from-[#6f42c1] to-[#e83e8c]",
  "bg-gradient-to-r from-[#fd7e14] to-[#dc3545]",
];

interface LessonPageProps {
  params: {
    id: string; // El ID del Optikids de la URL
  };
}

export default function LessonPage({ params }: LessonPageProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [optikids, setOptikids] = useState<Optikids | null>(null); // State for optikids data
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingOptikids, setLoadingOptikids] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("LessonPage - params.id:", params.id); // Debugging
    const fetchOptikidsData = async () => {
      try {
        setLoadingOptikids(true);
        const data = await api.get<Optikids>(`/optikids/${params.id}`);
        setOptikids(data);
        console.log("LessonPage - Fetched Optikids data:", data); // Debugging
      } catch (err: any) {
        console.error(
          `LessonPage - Failed to fetch Optikids data for ID ${params.id}:`,
          err
        );
        setError(
          err.message || "No se pudo cargar la información de Optikids."
        );
      } finally {
        setLoadingOptikids(false);
      }
    };
    fetchOptikidsData();
  }, [params.id]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoadingLessons(true);
        const fetchedLessons: Lesson[] = await api.get(
          `/optikids/${params.id}/lessons`
        );

        // Ordenar por id ascendente (más antiguo primero)
        const sorted = [...fetchedLessons].sort((a, b) => {
          const aId = typeof a.id === "string" ? Number(a.id) : a.id;
          const bId = typeof b.id === "string" ? Number(b.id) : b.id;
          return aId - bId;
        });

        setLessons(sorted);
      } catch (err) {
        console.error(
          `LessonPage - Failed to fetch lessons for Optikids ID ${params.id}:`,
          err
        );
        setError(
          "No se pudieron cargar las lecciones. Inténtalo de nuevo más tarde."
        );
      } finally {
        setLoadingLessons(false);
      }
    };
    fetchLessons();
  }, [params.id]);

  const loading = loadingLessons || loadingOptikids;
  const lang = optikids?.bandera || "ES"; // Use optikids.bandera for translation

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 md:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <p className="text-gray-600 text-lg">Cargando lecciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 md:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 md:px-6 lg:px-8 bg-gray-50 min-h-screen">
        <p className="text-gray-600 text-lg">
          No hay lecciones disponibles para este Optikids.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white pt-0 pb-0 relative">
      {/* Césped superior */}
      <div
        className="w-full h-14 bg-repeat-x bg-[length:auto_100%]"
        style={{ backgroundImage: "url('/optikids/top-grass.png')" }}
      />
      <h1 className="text-3xl md:text-4xl font-bold font-amsipronarwultra text-gray-800 mt-4 mb-2 text-center">
        {getTranslation(lang, "start_adventure")}
      </h1>
      <p className="text-gray-600 text-center mb-8 max-w-md hidden md:block">
        {" "}
        {/* Added hidden md:block */}
        {getTranslation(lang, "recommend_mobile_ar")}
      </p>
      <div className="grid gap-24 w-full max-w-screen-lg px-4 md:px-6 lg:px-8 mt-16 md:mt-0">
        {lessons.map((lesson, index) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            gradientClass={gradientClasses[index % gradientClasses.length]}
            countryCode={lang} // Pass the determined language
            optikidsId={params.id} // Pass the optikids ID explicitly
          />
        ))}
      </div>

      {/* Footer completo sin espacios */}
      <div className="w-full relative mt-32">
        {" "}
        {/* mt-auto pushes footer to bottom */}
        {/* Césped pegado justo encima del fondo verde */}
        <div className="w-full relative h-14">
          <div
            className="absolute bottom-[-10px] left-0 w-full h-14 bg-repeat-x bg-[length:auto_100%] z-0"
            style={{
              backgroundImage: "url('/optikids/footer-grass-front.png')",
            }}
          />
        </div>
        {/* Zona de contacto con fondo verde */}
        <div className="w-full relative z-10 bg-green-0 py-6 px-4 md:px-10">
          <div className="text-white font-baloo font-black text-sm md:text-lg flex flex-col gap-2">
            <span className="text-xl font-baloo">Contacto</span>
            {optikids?.whatsUrl && (
              <a
                href={optikids.whatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Image
                  src="/optikids/whatsico.svg"
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                <span>{optikids.whatsText || "WhatsApp"}</span>
              </a>
            )}
            {optikids?.snapUrl && (
              <div className="relative w-full">
                <a
                  href={optikids.snapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute md:bottom-[20px] w-full flex justify-start md:justify-center"
                >
                  <Image
                    src="/optikids/snapico.svg"
                    alt="Snapchat"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  <span className="ml-1">
                    {optikids.snapText || "Snapchat"}
                  </span>
                </a>
              </div>
            )}
          </div>
          {/* Imagen portada1 en la esquina inferior derecha */}
          {optikids?.portada1 && (
            <Image
              src={optikids.portada1 || "/placeholder.svg"}
              alt="Decoración"
              width={200}
              height={200}
              className="absolute bottom-0 right-4 object-contain z-20 w-[210px] h-auto md:w-[300px]"
            />
          )}
        </div>
      </div>
    </div>
  );
}
