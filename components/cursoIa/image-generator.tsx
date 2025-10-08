"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Download, Loader2 } from "lucide-react"
import { api } from "@/lib/api" // 👈 importa tu helper

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const res = await api.post<{ image: string }>("/images/generate", { prompt })
      setGeneratedImage(res.image)
    } catch (error) {
      console.error("Error generating image:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `generated-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-black">Crea tu imagen y descárgala para la siguiente lección</h2>
      </div>

      <div className="bg-gray-9 rounded-2xl p-6 space-y-4">
        <h3 className="text-white text-lg font-medium text-center">¿En qué puedo ayudarte?</h3>

        <div className="relative">
          <Input
            placeholder="Crea la imagen de tus deseos..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
            disabled={isGenerating}
            className="bg-gray-10 border-gray-11 text-white placeholder:text-gray-11 pr-12 rounded-lg h-12"
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white hover:bg-gray-100 text-gray-800 rounded-full h-8 w-8 p-0"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <p className="text-gray-11 text-sm text-center">
          Importante: Tienes 2 créditos para crear tu imagen, sé claro y brinda la mayor cantidad de detalles posibles en la instrucción. 
        </p>

        {generatedImage && (
          <div className="space-y-3">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={generatedImage}
                alt="Generated image"
                className="w-full h-auto max-h-96 object-contain"
              />
            </div>
            <Button onClick={handleDownload} variant="outline" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Descargar Imagen
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
