"use server"

import { revalidatePath } from "next/cache"

interface PurchaseData {
  courseId?: number
  productId?: string
  paymentMethod: string
}

export async function createPurchase(data: PurchaseData) {
  console.log("📝 Creando compra con datos:", data)

  try {
    // En un caso real, aquí conectar��as con tu API de NestJS
    // para crear el registro de compra en la base de datos

    // Simulamos una respuesta exitosa
    const purchaseId = Math.floor(Math.random() * 1000000)

    const purchase = {
      id: purchaseId,
      courseId: data.courseId,
      productId: data.productId,
      status: "completed",
      createdAt: new Date().toISOString(),
    }

    console.log("✅ Compra simulada creada:", purchase)

    // Revalidar rutas que muestran contenido del usuario
    revalidatePath("/dashboard")
    revalidatePath("/mis-cursos")

    return purchase
  } catch (error) {
    console.error("❌ Error al crear compra:", error)
    throw error
  }
}

export async function getUserPurchases(userId: number) {
  // En un caso real, aquí conectarías con tu API de NestJS
  // para obtener las compras del usuario

  // Simulamos una respuesta
  return [
    {
      id: 12345,
      courseId: 1,
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ]
}

export async function hasUserPurchasedCourse(userId: number, courseId: number) {
  // En un caso real, aquí verificarías en tu base de datos
  // si el usuario ha comprado el curso

  const purchases = await getUserPurchases(userId)
  return purchases.some((purchase) => purchase.courseId === courseId)
}
