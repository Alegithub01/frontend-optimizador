"use client"

import Link from "next/link"
import { ArrowLeft, Lock, AlertCircle } from "lucide-react"

export default function NoAutorizadoPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icono de acceso denegado */}
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="w-8 h-8 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>

        {/* Mensaje */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-orange-600">Contenido no disponible</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            No tienes acceso a este contenido. Para acceder, necesitas adquirir este producto o curso primero.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link
            href="/productos"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
          >
            Ver Productos
          </Link>

          <Link
            href="/cursos"
            className="w-full inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            Ver Cursos
          </Link>

          <Link
            href="/mis-compras"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-2 text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Mis Compras
          </Link>
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            ¿Crees que esto es un error?
            <Link href="/contacto" className="text-orange-500 hover:text-orange-600 ml-1">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
