"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { PlusCircle, Save, ArrowLeft } from "lucide-react"
import type { Optikids, CreateOptikidsDto, UpdateOptikidsDto, Lesson } from "@/types/optikids"
import { api } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { LessonForm } from "./lesson-form"

const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cape Verde" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
]

interface OptikidsFormProps {
  initialOptikids?: Optikids
  isNew?: boolean
}

export function OptikidsForm({ initialOptikids, isNew = false }: OptikidsFormProps) {
  const router = useRouter()
  const [optikidsData, setOptikidsData] = useState<Partial<Optikids>>(initialOptikids || {})
  const [lessons, setLessons] = useState<Lesson[]>(initialOptikids?.lessons || [])
  const [loading, setLoading] = useState(false)
  const [newLessonTempIdCounter, setNewLessonTempIdCounter] = useState(0)

  useEffect(() => {
    setOptikidsData(initialOptikids || {})
    setLessons(initialOptikids?.lessons || [])
  }, [initialOptikids])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setOptikidsData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveOptikids = async () => {
    setLoading(true)
    try {
      if (optikidsData.id) {
        await api.patch<Optikids>(`/optikids/${optikidsData.id}`, optikidsData as UpdateOptikidsDto)
        toast({ title: "Optikids actualizado", description: "El Optikids ha sido actualizado exitosamente." })
      } else {
        const newOptikids = await api.post<Optikids>("/optikids", optikidsData as CreateOptikidsDto)
        toast({ title: "Optikids creado", description: "El nuevo Optikids ha sido creado exitosamente." })
        router.push(`/admin/optikids/${newOptikids.id}`)
        return
      }
      router.push("/admin/optikids")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Hubo un error al guardar Optikids.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddLesson = () => {
    if (typeof optikidsData.id !== "number") {
      toast({
        title: "Error",
        description: "Primero guarda el Optikids para poder añadir lecciones.",
        variant: "destructive",
      })
      return
    }

    setLessons((prev) => [
      ...prev,
      {
        id: `new-${newLessonTempIdCounter}` as any,
        etiqueta: "",
        titulo: "",
        descripcion: "",
        urlAndroid: "",
        urlIos: "",
        urlVideo: "",
        urlSnap: "",
        optikidsId: optikidsData.id as number,
      },
    ])
    setNewLessonTempIdCounter((prev) => prev + 1)
  }

  const handleLessonSaveSuccess = (savedLesson: Lesson, tempId?: string) => {
    setLessons((prev) => {
      if (tempId) {
        const existingIndex = prev.findIndex((lesson) => lesson.id === tempId)
        if (existingIndex > -1) {
          const newLessons = [...prev]
          newLessons[existingIndex] = savedLesson
          return newLessons
        }
      }
      const existingIndexByRealId = prev.findIndex((lesson) => lesson.id === savedLesson.id)
      if (existingIndexByRealId > -1) {
        const newLessons = [...prev]
        newLessons[existingIndexByRealId] = savedLesson
        return newLessons
      }
      return [...prev, savedLesson]
    })
    toast({ title: "Lección guardada", description: "La lección ha sido guardada exitosamente." })
  }

  const handleLessonDeleteSuccess = (deletedLessonId: number | string) => {
    setLessons((prev) => prev.filter((lesson) => lesson.id !== deletedLessonId))
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.push("/admin/optikids")} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a la lista
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>
            {isNew ? "Crear Nuevo Optikids" : `Editar Optikids: ${optikidsData.name || "Cargando..."}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={optikidsData.name || ""} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion1">Descripción 1</Label>
            <Textarea
              id="descripcion1"
              name="descripcion1"
              value={optikidsData.descripcion1 || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descripcion2">Descripción 2</Label>
            <Textarea
              id="descripcion2"
              name="descripcion2"
              value={optikidsData.descripcion2 || ""}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="portada1">Portada 1 URL</Label>
            <Input id="portada1" name="portada1" value={optikidsData.portada1 || ""} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="portada2">Portada 2 URL</Label>
            <Input id="portada2" name="portada2" value={optikidsData.portada2 || ""} onChange={handleChange} />
          </div>

          {/* Aquí reemplazamos input bandera por select */}
          <div className="grid gap-2">
            <Label htmlFor="bandera">País</Label>
            <select
              id="bandera"
              name="bandera"
              value={optikidsData.bandera || ""}
              onChange={handleChange}
              className="rounded border border-gray-300 px-3 py-2"
            >
              <option value="">Selecciona un país</option>
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={handleAddLesson} disabled={!optikidsData.id}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Añadir Lección
          </Button>
          <Button onClick={handleSaveOptikids} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Guardando..." : "Guardar Optikids"}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-8 space-y-6">
        {lessons.map((lesson) => (
          <LessonForm
            key={lesson.id}
            initialLesson={lesson}
            optikidsId={optikidsData.id as number}
            onSaveSuccess={handleLessonSaveSuccess}
            onDeleteSuccess={handleLessonDeleteSuccess}
          />
        ))}
      </div>
    </div>
  )
}
