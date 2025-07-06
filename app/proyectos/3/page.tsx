"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { getCurrentUser, canAccessAdmin } from "@/lib/auth"
import Link from "next/link"
import VimeoPlayer from "@/components/VimeoPlayer"
import CountdownTimer from "@/components/countdown-timer"

export default function OptikidsPage() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState({
    heroTitle: "Optikids",
    heroSubtitle: "Escuela financiera",
    heroImage: "/icons/opti.png",
    courseTitle: "Curso: OPTIKIDS Escuela financiera para niños (5-9 años)",
    courseDescription:
      "Nuestros cursos presenciales ofrecen una experiencia interactiva donde los niños aprenden conceptos financieros a través de juegos, actividades prácticas y dinámicas grupales.",
    courseDate: "Sábado, 10 de mayo 2024",
    courseTime: "10:00 am - 16:00 pm",
    courseAge: "Edad: 7 a 9 años",
    countdownDate: "2024-05-10T10:00:00",
    whatIsTitle: "¿Qué es Optikids?",
    whatIsDescription:
      "Optikids es una escuela financiera especializada en enseñar a niños y adolescentes conceptos fundamentales sobre dinero, ahorro, inversión y emprendimiento de manera práctica y divertida.",
    firstVideoId: "1091240808",
    firstVideoHash: "48499695cd",
    secondVideoId: "",
    secondVideoHash: "",
    projectsTitle: "¿Qué proyectos tenemos para ti?",
    projectsDescription: "Descubre nuestros diferentes programas diseñados para cada etapa del aprendizaje financiero",
    project1Title: "OPTI 2024",
    project1Description: "Programa básico de educación financiera para principiantes",
    project1Image: "/placeholder.svg?height=200&width=300",
    project1WhatsApp: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20el%20programa%20OPTI%202024",
    project2Title: "OPTIKIDS ESCUELA FINANCIERA",
    project2Description: "Programa completo de educación financiera para niños y adolescentes",
    project2Image: "/images/optikids-detail.png",
    project2WhatsApp: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20OPTIKIDS%20Escuela%20Financiera",
    project3Title: "OPTI KIDS",
    project3Description: "Programa avanzado de emprendimiento y liderazgo financiero",
    project3Image: "/placeholder.svg?height=200&width=300",
    project3WhatsApp: "https://wa.me/1234567890?text=Hola,%20me%20interesa%20el%20programa%20OPTI%20KIDS",
  })

  useEffect(() => {
    const currentUser = getCurrentUser()

    if (currentUser) {
      setUser(currentUser)
      setIsAdmin(canAccessAdmin(currentUser.role))
    }

    const savedContent = localStorage.getItem("optikidsContent")
    if (savedContent) {
      setContent(JSON.parse(savedContent))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("optikidsContent", JSON.stringify(content))
    setIsEditing(false)
    alert("Contenido guardado exitosamente!")
  }

  const handleInputChange = (field: string, value: string) => {
    setContent((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Admin Controls */}
      {isAdmin && (
        <div className="fixed top-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border">
          <div className="flex gap-2 items-center">
            <div className="text-xs text-gray-500">
              {user?.name} ({user?.role?.toUpperCase()})
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
            >
              {isEditing ? "Cancelar" : "Editar"}
            </button>
            {isEditing && (
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
              >
                Guardar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 to-green-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={content.heroSubtitle}
                  onChange={(e) => handleInputChange("heroSubtitle", e.target.value)}
                  className="text-black font-medium mb-2 border rounded px-2 py-1 w-full"
                />
              ) : (
                <p className="text-black font-medium mb-2">{content.heroSubtitle}</p>
              )}

              {isEditing ? (
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) => handleInputChange("heroTitle", e.target.value)}
                  className="text-4xl md:text-6xl font-black text-gray-900 mb-6 border rounded px-2 py-1 w-full"
                />
              ) : (
                <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">{content.heroTitle}</h1>
              )}

              <button className="bg-orange-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-orange-600 transition-colors">
                Conocenos
              </button>
            </div>
            <div className="relative">
              <div className="relative z-10 flex justify-center">
                {isEditing && (
                  <div className="mb-2">
                    <input
                      type="url"
                      value={content.heroImage}
                      onChange={(e) => handleInputChange("heroImage", e.target.value)}
                      className="border rounded px-2 py-1 w-full text-sm"
                      placeholder="URL de Cloudinary para imagen hero"
                    />
                  </div>
                )}
                <Image
                  src={content.heroImage || "/placeholder.svg"}
                  alt="Personaje Optikids"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Primer Video Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Columna izquierda - Video y contador */}
              <div>
                {/* Video de Vimeo */}
                <div className="relative mb-8">
                  {isEditing ? (
                    <div className="aspect-video bg-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 p-4">
                      <div className="w-full space-y-2">
                        <input
                          type="text"
                          placeholder="ID del video de Vimeo (ej: 1091240808)"
                          value={content.firstVideoId}
                          onChange={(e) => handleInputChange("firstVideoId", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                        <input
                          type="text"
                          placeholder="Hash del video (ej: 48499695cd) - Opcional"
                          value={content.firstVideoHash}
                          onChange={(e) => handleInputChange("firstVideoHash", e.target.value)}
                          className="border rounded px-2 py-1 w-full"
                        />
                      </div>
                      <p className="text-xs text-gray-500 text-center">
                        Copia el ID y hash desde el código de inserción de Vimeo
                      </p>
                    </div>
                  ) : (
                    <VimeoPlayer
                      videoId={content.firstVideoId}
                      hash={content.firstVideoHash}
                      title="Primer video del curso"
                      className="aspect-video"
                      autoplay={false}
                      showTitle={false}
                    />
                  )}
                </div>

                {/* Contador funcional debajo del video */}
                <div className="mb-4">
                  {isEditing && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha y hora del evento (YYYY-MM-DDTHH:MM:SS):
                      </label>
                      <input
                        type="datetime-local"
                        value={content.countdownDate.slice(0, 16)} // Formato para datetime-local
                        onChange={(e) => handleInputChange("countdownDate", e.target.value + ":00")}
                        className="border rounded px-2 py-1 w-full"
                      />
                    </div>
                  )}
                  <CountdownTimer targetDate={content.countdownDate} />
                </div>
              </div>

              {/* Columna derecha - Información del curso */}
              <div className="bg-white rounded-2xl p-8">
                {isEditing ? (
                  <input
                    type="text"
                    value={content.courseTitle}
                    onChange={(e) => handleInputChange("courseTitle", e.target.value)}
                    className="text-2xl font-bold text-gray-900 mb-4 border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{content.courseTitle}</h3>
                )}

                {isEditing ? (
                  <textarea
                    value={content.courseDescription}
                    onChange={(e) => handleInputChange("courseDescription", e.target.value)}
                    className="text-gray-600 mb-6 border rounded px-2 py-1 w-full h-24 resize-none"
                  />
                ) : (
                  <p className="text-gray-600 mb-6">{content.courseDescription}</p>
                )}

                <div className="space-y-3 mb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <Image src="/icons/reloj.png" alt="Calendario" width={16} height={16} className="object-contain" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={content.courseDate}
                        onChange={(e) => handleInputChange("courseDate", e.target.value)}
                        className="border rounded px-2 py-1 flex-1"
                      />
                    ) : (
                      <span>{content.courseDate}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Image src="/icons/reloj.png" alt="Reloj" width={16} height={16} className="object-contain" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={content.courseTime}
                        onChange={(e) => handleInputChange("courseTime", e.target.value)}
                        className="border rounded px-2 py-1 flex-1"
                      />
                    ) : (
                      <span>{content.courseTime}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Image src="/icons/grup.png" alt="Edad" width={16} height={16} className="object-contain" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={content.courseAge}
                        onChange={(e) => handleInputChange("courseAge", e.target.value)}
                        className="border rounded px-2 py-1 flex-1"
                      />
                    ) : (
                      <span>{content.courseAge}</span>
                    )}
                  </div>
                </div>

                <Link
                  href="/proyectos/3/curso"
                  className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-block text-center"
                >
                  Ver más
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Segundo Video Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-8">
              {isEditing ? (
                <div className="aspect-video bg-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 p-4">
                  <div className="w-full space-y-2">
                    <input
                      type="text"
                      placeholder="ID del segundo video de Vimeo"
                      value={content.secondVideoId}
                      onChange={(e) => handleInputChange("secondVideoId", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                    <input
                      type="text"
                      placeholder="Hash del segundo video - Opcional"
                      value={content.secondVideoHash}
                      onChange={(e) => handleInputChange("secondVideoHash", e.target.value)}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">Segundo video de Vimeo</p>
                </div>
              ) : (
                <VimeoPlayer
                  videoId={content.secondVideoId}
                  hash={content.secondVideoHash}
                  title="Segundo video"
                  className="aspect-video"
                  showTitle={false}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ¿Qué es Optikids? Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {isEditing ? (
              <input
                type="text"
                value={content.whatIsTitle}
                onChange={(e) => handleInputChange("whatIsTitle", e.target.value)}
                className="text-3xl md:text-4xl font-black text-gray-900 mb-4 border rounded px-2 py-1 text-center"
              />
            ) : (
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{content.whatIsTitle}</h2>
            )}

            {isEditing ? (
              <textarea
                value={content.whatIsDescription}
                onChange={(e) => handleInputChange("whatIsDescription", e.target.value)}
                className="text-gray-600 max-w-3xl mx-auto leading-relaxed border rounded px-2 py-1 w-full h-24 resize-none"
              />
            ) : (
              <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">{content.whatIsDescription}</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/icons/social.svg"
                  alt="Aprendizaje Social"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aprendizaje Social</h3>
              <p className="text-gray-600">Fomentamos el trabajo en equipo y la colaboración</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/icons/financiera.svg"
                  alt="Educación Financiera"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Educación Financiera</h3>
              <p className="text-gray-600">Conceptos adaptados para cada edad</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Image
                  src="/icons/objet.svg"
                  alt="Objetivos Claros"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Objetivos Claros</h3>
              <p className="text-gray-600">Metas específicas para cada estudiante</p>
            </div>
          </div>
        </div>
      </section>

      {/* Proyectos Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            {isEditing ? (
              <input
                type="text"
                value={content.projectsTitle}
                onChange={(e) => handleInputChange("projectsTitle", e.target.value)}
                className="text-3xl md:text-4xl font-black text-gray-900 mb-4 border rounded px-2 py-1 text-center w-full"
              />
            ) : (
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{content.projectsTitle}</h2>
            )}

            {isEditing ? (
              <textarea
                value={content.projectsDescription}
                onChange={(e) => handleInputChange("projectsDescription", e.target.value)}
                className="text-gray-600 max-w-2xl mx-auto border rounded px-2 py-1 w-full h-16 resize-none"
              />
            ) : (
              <p className="text-gray-600 max-w-2xl mx-auto">{content.projectsDescription}</p>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Proyecto 1 */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl overflow-hidden relative">
              <div className="relative h-48">
                {isEditing && (
                  <div className="absolute top-2 left-2 right-2 z-10">
                    <input
                      type="url"
                      value={content.project1Image}
                      onChange={(e) => handleInputChange("project1Image", e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs bg-white/90"
                      placeholder="URL Cloudinary Proyecto 1"
                    />
                  </div>
                )}
                <Image
                  src={content.project1Image || "/placeholder.svg"}
                  alt="Proyecto 1"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40"></div>
              </div>
              <div className="p-8 text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={content.project1Title}
                    onChange={(e) => handleInputChange("project1Title", e.target.value)}
                    className="text-2xl font-black mb-4 border rounded px-2 py-1 w-full bg-gray-800"
                  />
                ) : (
                  <>
                    <div className="text-2xl font-black mb-2">OPTI</div>
                    <div className="text-2xl font-black mb-4">2024</div>
                  </>
                )}

                {isEditing ? (
                  <textarea
                    value={content.project1Description}
                    onChange={(e) => handleInputChange("project1Description", e.target.value)}
                    className="mb-6 border rounded px-2 py-1 w-full h-16 resize-none bg-gray-800"
                  />
                ) : (
                  <p className="mb-6 opacity-80">{content.project1Description}</p>
                )}

                {isEditing && (
                  <input
                    type="url"
                    value={content.project1WhatsApp}
                    onChange={(e) => handleInputChange("project1WhatsApp", e.target.value)}
                    className="border rounded px-2 py-1 w-full bg-gray-800 text-sm mb-2"
                    placeholder="URL de WhatsApp"
                  />
                )}

                <a
                  href={content.project1WhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-block"
                >
                  Conocer más
                </a>
              </div>
            </div>

            {/* Proyecto 2 - OPTIKIDS ESCUELA FINANCIERA */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl overflow-hidden relative">
              <div className="relative h-48">
                {isEditing && (
                  <div className="absolute top-2 left-2 right-2 z-10">
                    <input
                      type="url"
                      value={content.project2Image}
                      onChange={(e) => handleInputChange("project2Image", e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs bg-white/90"
                      placeholder="URL Cloudinary Proyecto 2"
                    />
                  </div>
                )}
                <Image
                  src={content.project2Image || "/placeholder.svg"}
                  alt="Proyecto 2"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-blue-600/60"></div>
              </div>
              <div className="p-8 text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={content.project2Title}
                    onChange={(e) => handleInputChange("project2Title", e.target.value)}
                    className="text-xl font-black mb-4 border rounded px-2 py-1 w-full bg-blue-700"
                  />
                ) : (
                  <>
                    <div className="text-xl font-black mb-2">OPTIKIDS</div>
                    <div className="text-xl font-black mb-4">ESCUELA FINANCIERA</div>
                  </>
                )}

                {isEditing ? (
                  <textarea
                    value={content.project2Description}
                    onChange={(e) => handleInputChange("project2Description", e.target.value)}
                    className="mb-6 border rounded px-2 py-1 w-full h-16 resize-none bg-blue-700"
                  />
                ) : (
                  <p className="mb-6 opacity-80">{content.project2Description}</p>
                )}

                {isEditing && (
                  <input
                    type="url"
                    value={content.project2WhatsApp}
                    onChange={(e) => handleInputChange("project2WhatsApp", e.target.value)}
                    className="border rounded px-2 py-1 w-full bg-blue-700 text-sm mb-2"
                    placeholder="URL de WhatsApp"
                  />
                )}

                <a
                  href={content.project2WhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-block"
                >
                  Conocer más
                </a>
              </div>
            </div>

            {/* Proyecto 3 */}
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl overflow-hidden relative">
              <div className="relative h-48">
                {isEditing && (
                  <div className="absolute top-2 left-2 right-2 z-10">
                    <input
                      type="url"
                      value={content.project3Image}
                      onChange={(e) => handleInputChange("project3Image", e.target.value)}
                      className="border rounded px-2 py-1 w-full text-xs bg-white/90"
                      placeholder="URL Cloudinary Proyecto 3"
                    />
                  </div>
                )}
                <Image
                  src={content.project3Image || "/placeholder.svg"}
                  alt="Proyecto 3"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-purple-600/40"></div>
              </div>
              <div className="p-8 text-white">
                {isEditing ? (
                  <input
                    type="text"
                    value={content.project3Title}
                    onChange={(e) => handleInputChange("project3Title", e.target.value)}
                    className="text-2xl font-black mb-4 border rounded px-2 py-1 w-full bg-purple-700"
                  />
                ) : (
                  <>
                    <div className="text-2xl font-black mb-2">OPTI</div>
                    <div className="text-2xl font-black mb-4">KIDS</div>
                  </>
                )}

                {isEditing ? (
                  <textarea
                    value={content.project3Description}
                    onChange={(e) => handleInputChange("project3Description", e.target.value)}
                    className="mb-6 border rounded px-2 py-1 w-full h-16 resize-none bg-purple-700"
                  />
                ) : (
                  <p className="mb-6 opacity-80">{content.project3Description}</p>
                )}

                {isEditing && (
                  <input
                    type="url"
                    value={content.project3WhatsApp}
                    onChange={(e) => handleInputChange("project3WhatsApp", e.target.value)}
                    className="border rounded px-2 py-1 w-full bg-purple-700 text-sm mb-2"
                    placeholder="URL de WhatsApp"
                  />
                )}

                <a
                  href={content.project3WhatsApp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-orange-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors inline-block"
                >
                  Conocer más
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}