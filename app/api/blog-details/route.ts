import { NextResponse } from "next/server"

// Variable para almacenar los detalles de blogs
let blogDetailsData = [
  {
    slug: "que-es-marketing-en-negocios",
    date: "01-04-2024",
    author: "por Nochur Crosby",
    title: "¿Qué es marketing en negocios?",
    heroImage: "/placeholder.svg?height=400&width=800",
    subtitle: "Fundamentos del marketing empresarial",
    mainContent: `El marketing en negocios es una disciplina fundamental que se encarga de identificar, anticipar y satisfacer las necesidades del cliente de manera rentable. Es el puente que conecta a las empresas con sus consumidores, creando valor tanto para el negocio como para el cliente.

En el mundo empresarial actual, el marketing no se limita únicamente a la publicidad o las ventas. Es una filosofía integral que abarca desde la investigación de mercado hasta la fidelización del cliente, pasando por el desarrollo de productos, la fijación de precios y la distribución.

El marketing efectivo requiere una comprensión profunda del mercado objetivo, sus necesidades, deseos y comportamientos de compra. Esta información permite a las empresas desarrollar estrategias que no solo atraigan clientes, sino que también los mantengan comprometidos a largo plazo.`,
    secondaryContent: `Una estrategia de marketing exitosa debe considerar varios elementos clave: la segmentación del mercado, el posicionamiento de la marca, la propuesta de valor única y los canales de comunicación más efectivos.

La segmentación permite dividir el mercado en grupos más pequeños y homogéneos, facilitando la personalización de mensajes y ofertas. El posicionamiento, por su parte, define cómo queremos que los consumidores perciban nuestra marca en relación con la competencia.

En la era digital, el marketing ha evolucionado significativamente. Las redes sociales, el marketing de contenidos, el SEO y la publicidad online han abierto nuevas oportunidades para conectar con los clientes de manera más directa y medible.

El futuro del marketing empresarial se centra en la personalización, la automatización y el uso de datos para tomar decisiones más informadas. Las empresas que logren adaptarse a estos cambios tendrán una ventaja competitiva significativa en el mercado.`,
  },
  {
    slug: "estrategias-inversion-principiantes",
    date: "15-04-2024",
    author: "por María González",
    title: "Estrategias de inversión para principiantes",
    heroImage: "/placeholder.svg?height=400&width=800",
    subtitle: "Tu primera guía hacia la libertad financiera",
    mainContent: `Comenzar en el mundo de las inversiones puede parecer abrumador, pero con las estrategias correctas y una mentalidad disciplinada, cualquier persona puede construir un portafolio sólido que genere riqueza a largo plazo.

El primer paso es entender que invertir no es apostar. Es un proceso sistemático de colocar dinero en activos que tienen el potencial de generar rendimientos superiores a la inflación, preservando y aumentando tu poder adquisitivo con el tiempo.

Antes de realizar cualquier inversión, es crucial establecer objetivos financieros claros. ¿Estás ahorrando para la jubilación, para comprar una casa, o para crear un fondo de emergencia? Cada objetivo requiere una estrategia de inversión diferente en términos de horizonte temporal y tolerancia al riesgo.`,
    secondaryContent: `La diversificación es uno de los principios más importantes en las inversiones. No pongas todos tus huevos en una sola canasta. Distribuye tus inversiones entre diferentes clases de activos: acciones, bonos, bienes raíces y materias primas.

Para principiantes, los fondos indexados son una excelente opción. Estos fondos replican el rendimiento de un índice específico, como el S&P 500, ofreciendo diversificación instantánea con costos bajos.

El concepto de "costo promedio" es otra estrategia valiosa. En lugar de invertir una suma grande de una vez, invierte cantidades fijas regularmente. Esto reduce el impacto de la volatilidad del mercado y elimina la necesidad de intentar cronometrar el mercado.

Recuerda que las inversiones exitosas requieren paciencia y disciplina. Los mercados fluctúan, pero históricamente, los inversores pacientes que mantienen sus inversiones a largo plazo han sido recompensados con rendimientos sólidos.`,
  },
  {
    slug: "educacion-financiera-ninos",
    date: "30-04-2024",
    author: "por Carlos Rodríguez",
    title: "Educación financiera para niños",
    heroImage: "/placeholder.svg?height=400&width=800",
    subtitle: "Formando futuros emprendedores desde temprana edad",
    mainContent: `La educación financiera en la infancia es una de las mejores inversiones que podemos hacer en el futuro de nuestros hijos. Enseñar conceptos financieros básicos desde temprana edad les proporciona las herramientas necesarias para tomar decisiones inteligentes con el dinero a lo largo de su vida.

Los niños son naturalmente curiosos sobre el dinero. Ven a sus padres usarlo constantemente y quieren entender cómo funciona. Esta curiosidad natural es la puerta perfecta para introducir conceptos financieros de manera divertida y educativa.

Comenzar con conceptos básicos como la diferencia entre necesidades y deseos es fundamental. Los niños deben entender que no todo lo que queremos es algo que necesitamos, y que el dinero es un recurso limitado que debe ser administrado sabiamente.`,
    secondaryContent: `El ahorro es probablemente el concepto más importante que podemos enseñar a los niños. Usar alcancías transparentes les permite ver cómo crece su dinero con el tiempo. Establecer metas de ahorro para juguetes o actividades especiales les enseña el valor de la paciencia y la planificación.

Los juegos y actividades prácticas son herramientas poderosas para la educación financiera. Juegos de mesa como Monopoly, actividades de compra simulada, o incluso permitir que los niños manejen pequeñas cantidades de dinero real en situaciones controladas.

Es importante también enseñar sobre el trabajo y cómo se gana el dinero. Los niños pueden realizar tareas domésticas apropiadas para su edad a cambio de una pequeña recompensa, ayudándoles a entender la relación entre esfuerzo y recompensa.

La educación financiera no se trata solo de dinero, sino de desarrollar habilidades de pensamiento crítico, planificación y toma de decisiones que servirán a los niños en todos los aspectos de su vida futura.`,
  },
]

export async function GET() {
  try {
    console.log("✅ API blog-details: SUCCESS")
    return NextResponse.json(blogDetailsData)
  } catch (error) {
    console.error("❌ API blog-details ERROR:", error)
    return NextResponse.json({ error: "Failed to load blog details" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const newData = await request.json()
    console.log("✅ API blog-details: Saving", newData.length, "blog details")
    blogDetailsData = newData
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("❌ API blog-details POST ERROR:", error)
    return NextResponse.json({ success: false, error: "Failed to save blog details" }, { status: 500 })
  }
}
