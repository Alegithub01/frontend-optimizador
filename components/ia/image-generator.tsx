"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Sparkles, Download, Copy } from "lucide-react"
import { api } from "@/lib/api"

interface GeneratedImage {
  imageBase64: string
  prompt: string
  timestamp: Date
}

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      console.log("[v0] Starting image generation with prompt:", prompt)
      const response = await api.post("/ia/generar-imagen", { prompt })
      console.log("[v0] Image generation response:", response)

      const newImage: GeneratedImage = {
        imageBase64: response.imageBase64,
        prompt: prompt,
        timestamp: new Date(),
      }

      setGeneratedImages((prev) => [newImage, ...prev])
      setPrompt("")
    } catch (err) {
      console.error("[v0] Error generating image:", err)
      setError(err instanceof Error ? err.message : "Error generando la imagen")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = (imageBase64: string, prompt: string) => {
    const link = document.createElement("a")
    link.href = imageBase64
    link.download = `ai-generated-${prompt.slice(0, 30).replace(/[^a-zA-Z0-9]/g, "-")}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground font-sans">Generador de Imágenes IA</h1>
          </div>
          <p className="text-muted-foreground font-serif text-lg">
            Transforma tus ideas en imágenes increíbles con inteligencia artificial
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-8 shadow-lg">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-foreground mb-2 font-serif">
                  Describe la imagen que quieres generar
                </label>
                <Textarea
                  id="prompt"
                  placeholder="Ej: Un paisaje futurista con montañas flotantes y cascadas de neón..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] resize-none font-serif"
                  disabled={isGenerating}
                />
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-destructive text-sm font-serif">{error}</p>
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full h-12 text-lg font-sans font-semibold"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generando imagen...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generar Imagen
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground font-sans">Imágenes Generadas</h2>

            <div className="grid gap-6">
              {generatedImages.map((image, index) => (
                <Card key={index} className="overflow-hidden shadow-lg">
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={image.imageBase64 || "/placeholder.svg"}
                        alt={image.prompt}
                        className="w-full h-auto max-h-[600px] object-contain bg-muted"
                      />

                      {/* Image Actions */}
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(image.imageBase64, image.prompt)}
                          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCopyPrompt(image.prompt)}
                          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Image Info */}
                    <div className="p-4 bg-card">
                      <p className="text-card-foreground font-serif text-sm leading-relaxed">
                        <strong>Prompt:</strong> {image.prompt}
                      </p>
                      <p className="text-muted-foreground text-xs mt-2 font-serif">
                        Generada el {image.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && (
          <Card className="text-center py-12">
            <CardContent>
              <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2 font-sans">¡Comienza a crear!</h3>
              <p className="text-muted-foreground font-serif">
                Escribe una descripción arriba y genera tu primera imagen con IA
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
