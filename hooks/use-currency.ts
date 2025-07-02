"use client"

import { useState, useEffect } from "react"

interface CurrencyData {
  code: string
  symbol: string
  rate: number
  name: string
}

interface UseCurrencyReturn {
  currency: CurrencyData
  formatPrice: (usdPrice: number) => string
  isLoading: boolean
  error: string | null
}

const DEFAULT_CURRENCY: CurrencyData = {
  code: "USD",
  symbol: "$",
  rate: 1,
  name: "US Dollar",
}

// Mapeo de países a monedas
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  US: "USD",
  BO: "BOB", // Bolivia
  AR: "ARS", // Argentina
  PE: "PEN", // Perú
  CL: "CLP", // Chile
  CO: "COP", // Colombia
  EC: "USD", // Ecuador usa USD
  BR: "BRL", // Brasil
  MX: "MXN", // México
  ES: "EUR", // España
  GB: "GBP", // Reino Unido
}

// Símbolos de monedas
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  BOB: "Bs.",
  ARS: "$",
  PEN: "S/",
  CLP: "$",
  COP: "$",
  BRL: "R$",
  MXN: "$",
  EUR: "€",
  GBP: "£",
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrency] = useState<CurrencyData>(DEFAULT_CURRENCY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const detectAndSetCurrency = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Detectar país del usuario
        let countryCode = "US" // fallback

        try {
          // Intentar detectar por IP
          const ipResponse = await fetch("https://ipapi.co/json/")
          if (ipResponse.ok) {
            const ipData = await ipResponse.json()
            countryCode = ipData.country_code || "US"
            console.log("🌍 País detectado:", countryCode, ipData.country_name)
          }
        } catch (ipError) {
          console.log("⚠️ No se pudo detectar país por IP, usando locale")
          // Fallback: detectar por locale del navegador
          const locale = navigator.language || "en-US"
          const localeCountry = locale.split("-")[1]
          if (localeCountry) {
            countryCode = localeCountry.toUpperCase()
          }
        }

        // Obtener moneda del país
        const currencyCode = COUNTRY_CURRENCY_MAP[countryCode] || "USD"
        console.log("💰 Moneda detectada:", currencyCode)

        if (currencyCode === "USD") {
          setCurrency(DEFAULT_CURRENCY)
          setIsLoading(false)
          return
        }

        // Obtener tasa de cambio
        try {
          const exchangeResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)

          if (exchangeResponse.ok) {
            const exchangeData = await exchangeResponse.json()
            const rate = exchangeData.rates[currencyCode]

            if (rate) {
              setCurrency({
                code: currencyCode,
                symbol: CURRENCY_SYMBOLS[currencyCode] || currencyCode,
                rate: rate,
                name: currencyCode,
              })
              console.log("💱 Tasa de cambio obtenida:", rate, currencyCode)
            } else {
              throw new Error("Moneda no encontrada")
            }
          } else {
            throw new Error("Error en API de cambio")
          }
        } catch (exchangeError) {
          console.log("⚠️ Error obteniendo tasa de cambio, usando USD")
          setCurrency(DEFAULT_CURRENCY)
        }
      } catch (err) {
        console.error("Error detectando moneda:", err)
        setError("Error detectando moneda local")
        setCurrency(DEFAULT_CURRENCY)
      } finally {
        setIsLoading(false)
      }
    }

    detectAndSetCurrency()
  }, [])

  const formatPrice = (usdPrice: number): string => {
    const localPrice = usdPrice * currency.rate

    try {
      // Usar Intl.NumberFormat para formatear según la región
      const formatter = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.code === "CLP" ? 0 : 2,
        maximumFractionDigits: currency.code === "CLP" ? 0 : 2,
      })

      return formatter.format(localPrice)
    } catch (formatError) {
      // Fallback manual si Intl.NumberFormat falla
      const roundedPrice = currency.code === "CLP" ? Math.round(localPrice) : Math.round(localPrice * 100) / 100

      return `${currency.symbol}${roundedPrice.toLocaleString()}`
    }
  }

  return {
    currency,
    formatPrice,
    isLoading,
    error,
  }
}
