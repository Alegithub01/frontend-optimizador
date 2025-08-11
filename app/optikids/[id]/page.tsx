"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { getTranslation } from "@/lib/translations";

type Optikids = {
  id: number;
  name: string;
  descripcion1: string;
  descripcion2: string;
  portada1: string | null;
  portada2?: string | null;
  videoTutorialUrl?: string | null;
  bandera: string;
  lessons: any[];
};

export default function OptikidsDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [optikids, setOptikids] = useState<Optikids | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptikids = async () => {
      try {
        setLoading(true);
        const data = await api.get<Optikids>(`/optikids/${id}`);
        setOptikids(data);
      } catch (err: any) {
        setError(err.message || "Error cargando Optikids");
      } finally {
        setLoading(false);
      }
    };
    fetchOptikids();
  }, [id]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;
  if (!optikids)
    return <p className="text-center mt-10">Optikids no encontrado</p>;

  const lang = optikids.bandera || "ES";

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      {/* Sección superior con fondo azul, logo, descripción y portada1 */}
      <div className="relative flex flex-col items-center bg-skyblue-0 flex-grow justify-end pb-[40px]">
        
        {/* Título "Optikids" como texto */}
        <h1 className="text-white text-8xl md:text-9xl font-amsiprocondultra font-bold mb-2 text-center mt-[-100px] md:mt-0">
          Optikids
        </h1>
        {/* Descripción "Aprendamos sobre finanzas" */}
        <p className="text-white text-lg md:text-xl text-center font-semibold max-w-xl px-4 mb-4">
          {optikids.descripcion2}
        </p>

        {/* Contenedor de la imagen principal (portada1) */}
        {optikids.portada1 && (
          <div className="relative w-full flex justify-center items-end h-full ">
            <div className="w-full h-[350px] md:h-[400px] lg:h-[600px] max-w-[400px] md:max-w-[500px] lg:max-w-[600px] overflow-hidden rounded-xl relative z-10 translate-y-[40px]">
              <Image
                src={optikids.portada1 || "/placeholder.svg"}
                alt={`Portada de ${optikids.name}`}
                width={979}
                height={576}
                className="w-full h-full"
                priority
              />
            </div>
            {/* Imagen del pasto - posicionada absolutamente en la parte inferior de esta sección azul */}
            <div
              className="absolute -bottom-14 left-0 w-full h-[75px] md:h-[100px] bg-repeat-x bg-[length:auto_100%] z-20"
              style={{
                backgroundImage: "url('/optikids/image-grass.png')",
              }}
            />
          </div>
        )}
      </div>

      {/* Sección con fondo verde y botones - comienza justo debajo de la sección azul */}
      <div className="bg-green-0 w-full flex flex-col justify-center shadow-lg px-6 py-6 md:py-12 mt-[-40px] flex-grow">
        <div className="max-w-[400px] md:max-w-[500px] lg:max-w-[600px] mx-auto w-full flex flex-col gap-2 items-center mt-8">
          <Button
            className="bg-orange-700 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full w-full"
            onClick={() => router.push(`/optikids/${optikids.id}/lesson`)}
          >
            {getTranslation(lang, "lets_go")}
          </Button>
          <Button
            variant="outline"
            className="shadow-lg bg-red-0 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-full w-full"
            onClick={() => {
              if (optikids.videoTutorialUrl) {
                router.push(`/optikids/${optikids.id}/tutorial`);
              } else {
                alert(getTranslation(lang, "video_not_available"));
              }
            }}
          >
            {getTranslation(lang, "video_tutorial")}
          </Button>
        </div>
      </div>
    </div>
  );
}
