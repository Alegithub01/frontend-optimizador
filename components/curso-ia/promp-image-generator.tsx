"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { api } from "@/lib/api" // Ajusta si usas otro helper

export default function ProyectoFuturoPage() {
  const [prompt, setPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt) return
    setLoading(true)
    setImageUrl("")
    try {
      const data = await api.post("/ia/generar-imagen", { prompt })
      setImageUrl(data.imageUrl)
    } catch (error) {
      alert("Error generando imagen.")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 text-center">
      <h1 className="text-3xl font-bold">¿Cómo imaginas tu futuro?</h1>

      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        placeholder="Ej: Me imagino teniendo una tienda exitosa en la ciudad"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Generando..." : "Generar Imagen con IA"}
      </button>

      {/* Opciones externas */}
      <div className="flex flex-col md:flex-row gap-4 justify-center mt-4">
        <Link
          href="https://chat.openai.com/?model=dall-e"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto"
        >
          <button className="w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition">
            Probar Generador de ChatGPT
          </button>
        </Link>

        <Link
          href="https://www.bing.com/images/create"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full md:w-auto"
        >
          <button className="w-full bg-purple-700 text-white py-2 px-4 rounded hover:bg-purple-800 transition">
            Probar Generador de Bing
          </button>
        </Link>
      </div>

      {/* Imagen generada */}
      {imageUrl && (
        <div className="mt-6">
          <Image
            src={imageUrl}
            alt="Imagen generada"
            width={512}
            height={512}
            className="rounded-lg border mx-auto"
          />
        </div>
      )}
    </div>
  )
}
