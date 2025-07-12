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
  EC: "USD", // Ecuador
  BR: "BRL", // Brasil
  MX: "MXN", // México
  ES: "EUR", // España
  GB: "GBP", // Reino Unido
  VE: "VES", // Venezuela
  UY: "UYU", // Uruguay
  PY: "PYG", // Paraguay
  CA: "CAD", // Canadá
  DE: "EUR", // Alemania
  FR: "EUR", // Francia
  IT: "EUR", // Italia
  PT: "EUR", // Portugal
  NL: "EUR", // Países Bajos
  BE: "EUR", // Bélgica
  CH: "CHF", // Suiza
  JP: "JPY", // Japón
  CN: "CNY", // China
  KR: "KRW", // Corea del Sur
  IN: "INR", // India
  RU: "RUB", // Rusia
  AU: "AUD", // Australia
  NZ: "NZD", // Nueva Zelanda
  ZA: "ZAR", // Sudáfrica
  TR: "TRY", // Turquía
  EG: "EGP", // Egipto
  IL: "ILS", // Israel
  TH: "THB", // Tailandia
  PH: "PHP", // Filipinas
  SG: "SGD", // Singapur
  MY: "MYR", // Malasia
  ID: "IDR", // Indonesia
  VN: "VND", // Vietnam
  NG: "NGN", // Nigeria
  KE: "KES", // Kenia
  UA: "UAH", // Ucrania
  CZ: "CZK", // República Checa
  PL: "PLN", // Polonia
  SE: "SEK", // Suecia
  NO: "NOK", // Noruega
  RO: "RON", // Rumanía
  HU: "HUF", // Hungría
  DK: "DKK", // Dinamarca
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
  VES: "Bs.",
  UYU: "$",
  PYG: "Gs.",
  CAD: "$",
  CHF: "CHF",
  JPY: "¥",
  CNY: "¥",
  KRW: "₩",
  INR: "₹",
  RUB: "₽",
  AUD: "$",
  NZD: "$",
  ZAR: "R",
  TRY: "₺",
  EGP: "E£",
  ILS: "₪",
  THB: "฿",
  PHP: "₱",
  SGD: "$",
  MYR: "RM",
  IDR: "Rp",
  VND: "₫",
  NGN: "₦",
  KES: "KSh",
  UAH: "₴",
  CZK: "Kč",
  PLN: "zł",
  SEK: "kr",
  NOK: "kr",
  RON: "lei",
  HUF: "Ft",
  DKK: "kr",
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

        let countryCode = "US"

        try {
          const ipResponse = await fetch("https://ipapi.co/json/")
          if (ipResponse.ok) {
            const ipData = await ipResponse.json()
            countryCode = ipData.country_code || "US"
          }
        } catch {
          const locale = navigator.language || "en-US"
          const localeCountry = locale.split("-")[1]
          if (localeCountry) {
            countryCode = localeCountry.toUpperCase()
          }
        }

        const currencyCode = COUNTRY_CURRENCY_MAP[countryCode] || "USD"

        if (currencyCode === "USD") {
          setCurrency(DEFAULT_CURRENCY)
          setIsLoading(false)
          return
        }

        try {
          const exchangeResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`)

          if (exchangeResponse.ok) {
            const exchangeData = await exchangeResponse.json()
            let rate = exchangeData.rates[currencyCode]

            // Sobrescribir para Bolivia con 6.96
            if (currencyCode === "BOB") rate = 6.96

            if (rate) {
              setCurrency({
                code: currencyCode,
                symbol: CURRENCY_SYMBOLS[currencyCode] || currencyCode,
                rate: rate,
                name: currencyCode,
              })
            } else {
              throw new Error("Moneda no encontrada")
            }
          } else {
            throw new Error("Error en API de cambio")
          }
        } catch {
          setCurrency(DEFAULT_CURRENCY)
        }
      } catch (err) {
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
      const formatter = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.code === "CLP" ? 0 : 2,
        maximumFractionDigits: currency.code === "CLP" ? 0 : 2,
      })

      return formatter.format(localPrice)
    } catch {
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
