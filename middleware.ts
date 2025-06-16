import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = ["/mi-aprendizaje", "/mis-compras"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    // Verificar si hay un token de autenticación en las cookies
    const authToken = request.cookies.get("authToken")?.value

    // Si no hay token, redirigir a login
    if (!authToken) {
      // Añadir un parámetro para indicar que es una redirección del middleware
      const url = new URL("/login", request.url)
      url.searchParams.set("redirect", pathname)
      url.searchParams.set("from_middleware", "true")
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/mi-aprendizaje/:path*", "/mis-compras/:path*"],
}
