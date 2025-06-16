"use client"

interface CountryInfo {
  country: string
  countryCode: string
  currency: string
  currencySymbol: string
  exchangeRate: number
}

export const CountryService = {
  /**
   * Detect user's country and currency information
   */
  detectCountry: async (): Promise<CountryInfo> => {
    try {
      // First, try to detect from the browser
      const browserLocale = navigator.language || navigator.languages?.[0]
      if (browserLocale?.includes("es-BO") || browserLocale?.includes("es_BO")) {
        return {
          country: "Bolivia",
          countryCode: "BO",
          currency: "BOB",
          currencySymbol: "Bs",
          exchangeRate: 6.96,
        }
      }

      // Try to detect from timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (timezone === "America/La_Paz") {
        return {
          country: "Bolivia",
          countryCode: "BO",
          currency: "BOB",
          currencySymbol: "Bs",
          exchangeRate: 6.96,
        }
      }

      // Fallback to external API with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000)

      try {
        const response = await fetch("https://ipapi.co/json/", {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
          },
        })
        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()

          if (data && data.country_code) {
            // Get exchange rate for the country's currency
            const exchangeResponse = await fetch(`https://open.er-api.com/v6/latest/USD`)
            const exchangeData = await exchangeResponse.json()

            if (exchangeData && exchangeData.rates) {
              // Mapping of country codes to currencies and symbols
              const currencyMap: Record<string, { currency: string; symbol: string }> = {
                US: { currency: "USD", symbol: "$" },
                BO: { currency: "BOB", symbol: "Bs" },
                MX: { currency: "MXN", symbol: "$" },
                ES: { currency: "EUR", symbol: "€" },
                AR: { currency: "ARS", symbol: "$" },
                CO: { currency: "COP", symbol: "$" },
                CL: { currency: "CLP", symbol: "$" },
                PE: { currency: "PEN", symbol: "S/" },
                // Add more countries as needed
              }

              const countryData = currencyMap[data.country_code] || { currency: "USD", symbol: "$" }

              // For Bolivia, we use a fixed exchange rate of 6.96
              const rate = data.country_code === "BO" ? 6.96 : exchangeData.rates[countryData.currency] || 1

              return {
                country: data.country_name || "Bolivia",
                countryCode: data.country_code || "BO",
                currency: countryData.currency,
                currencySymbol: countryData.symbol,
                exchangeRate: rate,
              }
            }
          }
        } else {
          throw new Error("API response not ok")
        }
      } catch (fetchError) {
        console.warn("Could not detect country from API:", fetchError)
      }

      // Fallback to Bolivia
      return {
        country: "Bolivia",
        countryCode: "BO",
        currency: "BOB",
        currencySymbol: "Bs",
        exchangeRate: 6.96,
      }
    } catch (error) {
      console.error("Error detecting country:", error)
      // Fallback to Bolivia
      return {
        country: "Bolivia",
        countryCode: "BO",
        currency: "BOB",
        currencySymbol: "Bs",
        exchangeRate: 6.96,
      }
    }
  },
}
