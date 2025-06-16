/**
 * Servicio para manejar pagos por QR utilizando la API de Red Enlace
 */

// Tipos para los datos de pago QR
export interface GenerarQrDto {
  numeroReferencia?: string | number
  glosa: string
  monto: number
  moneda: string
  canal: string
  tiempoQr: number | string
  campoExtra?: string
  userId: string | number
  type: "course" | "product" | "event"
  itemId: string
  // Datos del cliente
  fullName?: string
  phone?: string
  country?: string
  department?: string
  province?: string
}

export interface QrResponse {
  qr: {
    numeroReferencia: string
    fechaHora: string
    qrImage: string
    qrString: string
    estado: string
  }
  saleId: string
}

export interface QrStatusResponse {
  numeroReferencia: string
  estado: string
  fechaHora: string
  fechaHoraPago?: string
  glosa?: string
  monto?: number
  moneda?: string
}

/**
 * Genera un código QR para pago
 */
export async function generateQrPayment(data: GenerarQrDto): Promise<QrResponse> {
  try {
    // Asegurarse de que los datos estén en el formato correcto antes de enviarlos
    const formattedData = {
      ...data,
      // Asegurar que userId sea string
      userId: String(data.userId),
      // Asegurar que numeroReferencia sea string si existe
      ...(data.numeroReferencia && { numeroReferencia: String(data.numeroReferencia) }),
      // Asegurar que tiempoQr sea número o string según lo requerido
      tiempoQr: typeof data.tiempoQr === "string" ? data.tiempoQr : Number(data.tiempoQr),
    }

    console.log("Enviando datos para generar QR:", formattedData)

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qr/generar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(localStorage.getItem("authToken") && { Authorization: `Bearer ${localStorage.getItem("authToken")}` }),
      },
      body: JSON.stringify(formattedData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response from server:", errorText)
      throw new Error(`Error: ${response.status}`)
    }

    const result = await response.json()
    console.log("Respuesta del servidor (QR):", result)

    // Procesar la respuesta para asegurar que la imagen QR esté completa
    if (result.imagen && !result.qr) {
      // Si la respuesta tiene un formato diferente al esperado, adaptarla
      return {
        qr: {
          numeroReferencia: result.numeroReferencia || result.origenNumeroReferencia || String(data.numeroReferencia),
          fechaHora: new Date().toISOString(),
          qrImage: `data:image/png;base64,${result.imagen}`, // Asegurar que la imagen tenga el prefijo correcto
          qrString: result.qrString || "",
          estado: result.codigoRespuesta || "PENDING",
        },
        saleId: result.numeroReferencia || String(data.numeroReferencia),
      }
    }

    return result
  } catch (error: any) {
    console.error("Error generating QR payment:", error)
    throw new Error(error.message || "Error al generar el pago QR")
  }
}

// Actualizar la función checkQrStatus para manejar mejor los errores y mostrar más información

/**
 * Verifica el estado de un pago QR
 */
export async function checkQrStatus(numeroReferencia: string): Promise<QrStatusResponse> {
  try {
    console.log(`Verificando estado del QR con referencia: ${numeroReferencia}`)

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qr/estado/${numeroReferencia}`,
      {
        method: "GET",
        headers: {
          ...(localStorage.getItem("authToken") && { Authorization: `Bearer ${localStorage.getItem("authToken")}` }),
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response from server:", errorText)
      throw new Error(`Error: ${response.status}`)
    }

    const result = await response.json()
    console.log("Respuesta de verificación de estado:", result)

    return result
  } catch (error: any) {
    console.error("Error checking QR status:", error)
    throw new Error(error.message || "Error al verificar el estado del pago QR")
  }
}

/**
 * Marca un pago QR como completado (solo para pruebas)
 */
export async function markQrAsPaid(numeroReferencia: string): Promise<{ success: boolean; saleId: string }> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/qr/marcar-pagado/${numeroReferencia}`,
      {
        method: "POST",
        headers: {
          ...(localStorage.getItem("authToken") && { Authorization: `Bearer ${localStorage.getItem("authToken")}` }),
        },
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response from server:", errorText)
      throw new Error(`Error: ${response.status}`)
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error marking QR as paid:", error)
    throw new Error(error.message || "Error al marcar el pago QR como completado")
  }
}

// Modificar la función prepareQrData para corregir el cálculo del precio
export function prepareQrData(itemData: any, userId: string | number): GenerarQrDto {
  // Asegurarse de que el precio esté en el formato correcto y convertir de USD a BOB
  const priceUSD = typeof itemData.price === "number" ? itemData.price : Number.parseFloat(itemData.price || "0")
  const exchangeRate = 6.96 // Tipo de cambio fijo para Bolivia: 1 USD = 6.96 BOB

  // Corregir el cálculo del precio - asegurar que sea exacto
  // Multiplicar primero por 100 para trabajar con centavos, luego por el tipo de cambio
  // y finalmente dividir por 100 para volver a la unidad monetaria
  const priceBOB = Math.round(priceUSD * exchangeRate * 100) / 100

  console.log(`Conversión de precio: ${priceUSD} USD = ${priceBOB} BOB (tipo de cambio: ${exchangeRate})`)

  // Determinar el tipo de item
  let itemType: "course" | "product" | "event" = "product"
  let itemId = ""

  if (itemData.type === "course") {
    itemType = "course"
    itemId = String(itemData.id || itemData.courseId)
  } else if (itemData.type === "event") {
    itemType = "event"
    itemId = String(itemData.id || itemData.eventId)
  } else {
    itemType = "product"
    itemId = String(itemData.id || itemData.productId)
  }

  // Generar un número de referencia único basado en timestamp
  const timestamp = Date.now()
  const numeroReferencia = timestamp % 1000000 // Últimos 6 dígitos del timestamp

  // Crear la glosa con el formato específico requerido por Red Enlace
  // Formato: "00004|APAPACHANDO|5462|TRANSACCION QR CON Comercio Apapachando"
  const comercioId = "00004" // ID del comercio (ajustar según corresponda)
  const comercioNombre = "APAPACHANDO" // Nombre del comercio (ajustar según corresponda)
  const transaccionId = String(numeroReferencia).padStart(4, "0") // ID de transacción de 4 dígitos
  const descripcion = `TRANSACCION QR CON Comercio ${comercioNombre}`

  // Formato final de la glosa
  const glosa = `${comercioId}|${comercioNombre}|${transaccionId}|${descripcion}`

  // Obtener información del cliente desde itemData
  const billingInfo = itemData.billingInfo || {}
  const fullName =
    billingInfo.firstName && billingInfo.lastName
      ? `${billingInfo.firstName} ${billingInfo.lastName}`
      : itemData.fullName || ""
  const phone = billingInfo.phone || itemData.phone || ""
  const country = billingInfo.country || itemData.country || "Bolivia"
  const department = itemData.department || ""
  const province = itemData.needsHomeDelivery ? itemData.shippingAddress || "" : ""

  // Información adicional para el campo campoExtra
  const itemName = itemData.name || itemData.title || "Producto"
  const campoExtra = JSON.stringify({
    itemName,
    itemType,
    userId,
    fullName,
    phone,
    country,
    numeroReferencia,
    timestamp,
  })

  return {
    numeroReferencia,
    glosa,
    monto: priceBOB,
    moneda: "BOB", // Moneda boliviana
    canal: "WEB",
    tiempoQr: "23:59:59", // Formato de tiempo específico requerido por Red Enlace
    userId,
    type: itemType,
    itemId,
    // Datos del cliente
    fullName,
    phone,
    country,
    department,
    province,
    campoExtra,
  }
}
