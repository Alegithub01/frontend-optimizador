import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, Quote } from "lucide-react"

interface TestimonialPageProps {
  params: {
    id: string
  }
}

export default function TestimonialPage({ params }: TestimonialPageProps) {
  // En un caso real, estos datos vendrían de una base de datos
  const testimonials = [
    {
      id: 1,
      name: "María González",
      role: "Emprendedora",
      content:
        "El curso de Tinder de Emprendedores transformó mi negocio. Ahora tengo estrategias claras para integrar lo físico y lo digital, y mis ventas han aumentado un 40% en solo tres meses.",
      fullStory:
        "Cuando comencé mi negocio hace dos años, me enfrenté a muchos desafíos para atraer clientes. Intenté varias estrategias de marketing, pero ninguna parecía funcionar de manera consistente. Fue entonces cuando descubrí el curso Tinder de Emprendedores de Optimizador.\n\nDesde la primera lección, supe que este curso era diferente. Las estrategias eran prácticas y fáciles de implementar. Aprendí a identificar a mi cliente ideal, a crear mensajes que realmente resonaran con ellos y a combinar estrategias online y offline de manera efectiva.\n\nLo que más me gustó fue el enfoque paso a paso y el apoyo constante del instructor. Cada semana implementaba algo nuevo y veía resultados inmediatos. En solo tres meses, mis ventas aumentaron un 40% y ahora tengo un flujo constante de clientes interesados en mis servicios.\n\nRecomiendo este curso a cualquier emprendedor que quiera llevar su negocio al siguiente nivel. Ha sido una de las mejores inversiones que he hecho para mi empresa.",
      rating: 5,
      image: "/testimonial-1.jpg",
      avatar: "/avatar-1.jpg",
      course: "Tinder de Emprendedores",
      courseId: 1,
      location: "Madrid, España",
      date: "15 de Marzo, 2023",
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Padre y Empresario",
      content:
        "La Cápsula de Emprendedores me dio herramientas increíbles para enseñar a mis hijos sobre finanzas de una manera divertida. Ahora ellos entienden el valor del dinero y la importancia del ahorro.",
      fullStory:
        "Como padre de dos niños de 8 y 10 años, siempre me preocupó cómo enseñarles sobre finanzas personales de una manera que fuera comprensible y divertida para ellos. Probé varios métodos, pero ninguno parecía captar su interés por mucho tiempo.\n\nCuando descubrí la Cápsula de Emprendedores, decidí darle una oportunidad, aunque no estaba seguro si funcionaría. Para mi sorpresa, el curso superó todas mis expectativas. Las actividades y juegos propuestos eran tan entretenidos que mis hijos esperaban con ansias nuestras 'sesiones financieras' semanales.\n\nA través de juegos de rol, actividades prácticas y conversaciones guiadas, mis hijos comenzaron a entender conceptos como el ahorro, la inversión e incluso el emprendimiento. Lo que más me impresionó fue ver cómo estos conocimientos se traducían en cambios reales en su comportamiento. Ahora piensan antes de gastar su dinero, tienen metas de ahorro y mi hijo mayor incluso ha comenzado un pequeño negocio vendiendo limonada en el vecindario.\n\nEstoy profundamente agradecido por las herramientas que este curso nos ha proporcionado. No solo estamos creando hábitos financieros saludables, sino que también estamos fortaleciendo nuestra relación familiar a través de estas actividades compartidas.",
      rating: 5,
      image: "/testimonial-2.jpg",
      avatar: "/avatar-2.jpg",
      course: "Cápsula de Emprendedores",
      courseId: 2,
      location: "Barcelona, España",
      date: "20 de Abril, 2023",
    },
    {
      id: 3,
      name: "Laura Martínez",
      role: "Diseñadora",
      content:
        "El Desafío de los 7 Días fue exactamente lo que necesitaba para validar mi idea de negocio. Los pasos son claros y el apoyo constante. Recomiendo 100% esta experiencia.",
      fullStory:
        "Durante años tuve una idea de negocio rondando en mi cabeza: crear una plataforma que conectara a diseñadores freelance con pequeñas empresas que necesitaran servicios de diseño. Sin embargo, siempre encontraba excusas para no dar el primer paso, principalmente por miedo al fracaso y por no saber por dónde empezar.\n\nCuando me inscribí en el Desafío de los 7 Días, no tenía grandes expectativas. Pensaba que sería otro curso más con información teórica que nunca llegaría a aplicar. ¡Qué equivocada estaba! Desde el primer día, el curso me obligó a salir de mi zona de confort y a tomar acción.\n\nLo que más valoro del programa es su estructura clara y accionable. Cada día tenía una tarea específica que me acercaba más a validar mi idea: desde definir mi propuesta de valor hasta contactar a potenciales clientes para obtener feedback real. El apoyo del instructor y de la comunidad fue fundamental para mantenerme motivada y superar los obstáculos.\n\nAl finalizar los 7 días, no solo había validado que mi idea tenía potencial, sino que ya contaba con tres clientes interesados en trabajar conmigo. Ahora, tres meses después, mi plataforma está en funcionamiento y tengo más de 20 diseñadores registrados y 15 empresas utilizando nuestros servicios.\n\nSi tienes una idea de negocio pero no sabes cómo hacerla realidad, este desafío es para ti. Te dará la estructura, las herramientas y la confianza necesarias para pasar de la idea a la acción en tiempo récord.",
      rating: 4,
      image: "/testimonial-3.jpg",
      avatar: "/avatar-3.jpg",
      course: "Desafío de los 7 Días",
      courseId: 3,
      location: "Valencia, España",
      date: "5 de Mayo, 2023",
    },
  ]

  const testimonial = testimonials.find((t) => t.id === Number.parseInt(params.id))

  if (!testimonial) {
    return <div className="min-h-screen flex items-center justify-center">Testimonio no encontrado</div>
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link href="/testimonios" className="text-orange-500 hover:text-orange-600 flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a testimonios
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="relative h-80 md:h-96 rounded-lg overflow-hidden mb-8">
              <Image
                src={testimonial.image || "/placeholder.svg"}
                alt={testimonial.name}
                fill
                className="object-cover"
              />
            </div>

            <h1 className="text-3xl md:text-4xl font-bold mb-6">La historia de {testimonial.name}</h1>

            <div className="flex items-center mb-8">
              <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4">
                <Image
                  src={testimonial.avatar || "/placeholder.svg"}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg">{testimonial.name}</h3>
                <p className="text-gray-600">{testimonial.role}</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating ? "fill-orange-500 text-orange-500" : "fill-gray-300 text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-orange-500 mb-8">
                <Quote className="h-8 w-8 text-orange-500 mb-4" />
                <p className="text-lg italic text-gray-700">{testimonial.content}</p>
              </div>

              {testimonial.fullStory.split("\n\n").map((paragraph, index) => (
                <p key={index} className="text-gray-700 mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">Detalles</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="text-sm text-gray-500">Curso</h4>
                  <p className="font-medium">{testimonial.course}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Ubicación</h4>
                  <p className="font-medium">{testimonial.location}</p>
                </div>
                <div>
                  <h4 className="text-sm text-gray-500">Fecha</h4>
                  <p className="font-medium">{testimonial.date}</p>
                </div>
              </div>

              <Link href={`/cursos/${testimonial.courseId}`}>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-4">Ver el curso</Button>
              </Link>

              <Link href="/contacto">
                <Button variant="outline" className="w-full border-orange-500 text-orange-500 hover:bg-orange-50">
                  Contactar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
