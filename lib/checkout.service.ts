// Utility functions for checkout process

// Define proper types for checkout data
interface ShippingInfo {
  department?: string
  departmentName?: string
  isProvincialDelivery?: boolean
  address?: string
  fullName?: string
  phone?: string
  country?: string
}

// Customer information from checkout form
interface CustomerInfo {
  fullName: string
  phone: string
  email?: string
  country: string
  address?: string
  city?: string
  postalCode?: string
}

interface CheckoutData {
  name: string
  price: number
  image: string
  userId: string | number
  type: "course" | "product" | "event"
  deliveryType: "digital" | "physical" | "fisico"
  courseId?: string | number
  productId?: string | number
  eventId?: string | number
  shippingInfo?: ShippingInfo
  customerInfo: CustomerInfo // Always include customer info
}

/**
 * Prepares checkout data for the backend API
 */
export function prepareCheckoutData(itemData: any, userId: string): CheckoutData {
  console.log("PREPARANDO DATOS DE CHECKOUT - DATOS RECIBIDOS:", itemData)

  // Ensure we have the correct price format (convert to cents for Stripe)
  const price =
    typeof itemData.price === "number" ? Math.round(itemData.price * 100) : Number.parseInt(itemData.price) * 100

  // Map format to deliveryType if needed
  let deliveryType: "digital" | "physical" | "fisico" = "digital"
  if (itemData.deliveryType) {
    deliveryType = itemData.deliveryType as "digital" | "physical" | "fisico"
  } else if (itemData.format) {
    // Map "fisico" to the appropriate delivery type
    deliveryType = itemData.format as "digital" | "physical" | "fisico"
  }

  // Extract billing info from itemData
  const billingInfo = itemData.billingInfo || {}
  console.log("BILLING INFO EXTRAÍDA:", billingInfo)

  // Prepare customer information - ALWAYS include this regardless of product type
  const customerInfo: CustomerInfo = {
    fullName:
      billingInfo.firstName && billingInfo.lastName
        ? `${billingInfo.firstName} ${billingInfo.lastName}`
        : itemData.fullName || "",
    phone: billingInfo.phone || itemData.phone || "",
    email: billingInfo.email || itemData.email || "",
    country: billingInfo.country || itemData.country || "Bolivia",
    address: billingInfo.address || itemData.address || "",
    city: billingInfo.city || itemData.city || "",
    postalCode: billingInfo.postalCode || itemData.postalCode || "",
  }

  console.log("CUSTOMER INFO PREPARADA:", customerInfo)

  // Base checkout data
  const checkoutData: CheckoutData = {
    name: itemData.name || "Producto sin nombre",
    price: price || 0,
    image: itemData.image || "/placeholder.svg",
    userId: userId,
    type: (itemData.type || "product") as "course" | "product" | "event",
    deliveryType: deliveryType,
    customerInfo: customerInfo, // Always include customer info
  }

  // Add conditional fields based on item type
  if (checkoutData.type === "course" && itemData.id) {
    checkoutData.courseId = itemData.id
  } else if (checkoutData.type === "product" && itemData.id) {
    checkoutData.productId = itemData.id
  } else if (checkoutData.type === "event" && itemData.id) {
    checkoutData.eventId = itemData.id
  }

  // Add shipping info if it's a physical product
  if (deliveryType === "physical" || deliveryType === "fisico") {
    checkoutData.shippingInfo = {
      department: itemData.department || "",
      departmentName: itemData.departmentName || "",
      isProvincialDelivery: itemData.needsHomeDelivery || false,
      address: itemData.shippingAddress || "",
      fullName: customerInfo.fullName, // Use the same fullName from customerInfo
      phone: customerInfo.phone, // Use the same phone from customerInfo
      country: customerInfo.country, // Use the same country from customerInfo
    }
    console.log("SHIPPING INFO PREPARADA:", checkoutData.shippingInfo)
  }

  console.log("CHECKOUT DATA FINAL:", checkoutData)
  return checkoutData
}

/**
 * Validates checkout data before sending to backend
 */
export function validateCheckoutData(data: CheckoutData): { valid: boolean; message?: string } {
  console.log("VALIDANDO DATOS DE CHECKOUT:", data)

  // Check required fields
  if (!data.name) {
    return {
      valid: false,
      message: "El nombre del producto es requerido",
    }
  }

  if (!data.price || data.price <= 0) {
    return {
      valid: false,
      message: "El precio debe ser mayor a 0",
    }
  }

  if (!data.userId) {
    return {
      valid: false,
      message: "ID de usuario requerido",
    }
  }

  // Check customer information
  if (!data.customerInfo.fullName) {
    return {
      valid: false,
      message: "El nombre completo del cliente es requerido",
    }
  }

  if (!data.customerInfo.phone) {
    return {
      valid: false,
      message: "El teléfono del cliente es requerido",
    }
  }

  // Check that at least one ID is provided based on type
  if (data.type === "course" && !data.courseId) {
    return {
      valid: false,
      message: "ID del curso requerido",
    }
  }

  if (data.type === "product" && !data.productId) {
    return {
      valid: false,
      message: "ID del producto requerido",
    }
  }

  if (data.type === "event" && !data.eventId) {
    return {
      valid: false,
      message: "ID del evento requerido",
    }
  }

  // For physical products, validate shipping info
  if (data.deliveryType === "physical" || data.deliveryType === "fisico") {
    const shippingInfo = data.shippingInfo || {}

    if (!shippingInfo.department) {
      return {
        valid: false,
        message: "Selecciona un departamento para envío",
      }
    }

    if (shippingInfo.isProvincialDelivery && !shippingInfo.address) {
      return {
        valid: false,
        message: "Ingresa una dirección para envío a domicilio",
      }
    }
  }

  return { valid: true }
}
