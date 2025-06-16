"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react"

export default function CartPage() {
  // En un caso real, estos datos vendrían de un estado global o una base de datos
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      type: "curso",
      title: "TINDER DE EMPRENDEDORES",
      price: 99.99,
      quantity: 1,
      image: "/tinder-emprendedores.jpg",
    },
    {
      id: 3,
      type: "curso",
      title: "RETO-7-DÍAS",
      price: 15.0,
      quantity: 1,
      image: "/desafio-7dias.jpg",
    },
    {
      id: 1,
      type: "producto",
      title: "Libro: El Empleado Rico",
      price: 24.99,
      quantity: 2,
      image: "/libro-empleado-rico.png",
    },
  ])

  const handleRemoveItem = (index: number) => {
    const newCartItems = [...cartItems]
    newCartItems.splice(index, 1)
    setCartItems(newCartItems)
  }

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const newCartItems = [...cartItems]
    newCartItems[index].quantity = newQuantity
    setCartItems(newCartItems)
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = 5.0
  const total = subtotal + shipping

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="container mx-auto py-16 px-4 text-center">
          <div className="mb-8">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">Parece que aún no has añadido ningún producto a tu carrito.</p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">Continuar comprando</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Tu Carrito</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items - 2/3 width */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200">
                <div className="col-span-6 font-medium">Producto</div>
                <div className="col-span-2 font-medium text-center">Precio</div>
                <div className="col-span-2 font-medium text-center">Cantidad</div>
                <div className="col-span-2 font-medium text-right">Subtotal</div>
              </div>

              {cartItems.map((item, index) => (
                <div key={index} className="p-4 border-b border-gray-200 last:border-b-0">
                  <div className="md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    {/* Product */}
                    <div className="col-span-6 flex items-center mb-4 md:mb-0">
                      <div className="relative h-16 w-16 flex-shrink-0 mr-4">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.title}</h3>
                        <p className="text-sm text-gray-500 capitalize">{item.type}</p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-center mb-2 md:mb-0">
                      <div className="md:hidden text-sm text-gray-500 mb-1">Precio:</div>${item.price.toFixed(2)}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 flex justify-center mb-2 md:mb-0">
                      <div className="md:hidden text-sm text-gray-500 mr-2 mt-2">Cantidad:</div>
                      <div className="flex items-center">
                        <button
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l-md hover:bg-gray-100"
                          onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                        >
                          -
                        </button>
                        <div className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                          {item.quantity}
                        </div>
                        <button
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r-md hover:bg-gray-100"
                          onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="col-span-2 text-right flex justify-between md:justify-end items-center">
                      <div className="md:hidden text-sm text-gray-500">Subtotal:</div>
                      <div className="flex items-center">
                        <span className="mr-4">${(item.price * item.quantity).toFixed(2)}</span>
                        <button className="text-gray-400 hover:text-red-500" onClick={() => handleRemoveItem(index)}>
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link href="/">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                  Continuar comprando
                </Button>
              </Link>
            </div>
          </div>

          {/* Order Summary - 1/3 width */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Resumen del pedido</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío</span>
                  <span>${shipping.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white mb-4 py-6">
                Proceder al pago
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <div className="text-center text-sm text-gray-600 mb-4">Aceptamos múltiples métodos de pago</div>

              <div className="flex justify-center space-x-2">
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
                <div className="w-10 h-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
