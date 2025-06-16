import { NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16", // Use the latest API version
})

export async function POST(request: Request) {
  try {
    // Log the raw request
    console.log("Recibiendo solicitud de checkout")

    const body = await request.json()

    // Log the parsed body
    console.log("Datos recibidos:", JSON.stringify(body, null, 2))

    // Extract data from request body
    const {
      name,
      price,
      image,
      userId,
      courseId,
      productId,
      eventId,
      type,
      deliveryType,
      shippingInfo,
      // Customer info fields directly in the root
      fullName,
      phone,
      email,
      country,
      address,
      city,
      postalCode,
    } = body

    // Validate required fields
    if (!name || !price || !userId || !type) {
      console.error("Faltan campos requeridos:", { name, price, userId, type })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Log the metadata we're about to send to Stripe
    const metadata = {
      userId: String(userId),
      courseId: courseId ? String(courseId) : "",
      productId: productId ? String(productId) : "",
      eventId: eventId ? String(eventId) : "",
      type: type,
      deliveryType: deliveryType || "digital",
      // Customer information
      fullName: fullName || "",
      phone: phone || "",
      email: email || "",
      country: country || "",
      address: address || "",
      city: city || "",
      postalCode: postalCode || "",
      // Shipping information if applicable
      department: shippingInfo?.department || "",
      province: shippingInfo?.isProvincialDelivery ? shippingInfo?.address || "" : "",
    }

    console.log("Metadatos para Stripe:", metadata)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/cancel`,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: name,
              images: [image],
            },
            unit_amount: price, // Price should be in cents
          },
          quantity: 1,
        },
      ],
      metadata: metadata,
    })

    console.log("Sesión de Stripe creada:", { id: session.id, url: session.url })
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: error.message || "Error creating checkout session" }, { status: 500 })
  }
}
