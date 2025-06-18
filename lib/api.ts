const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export const api = {
  post: async <T = any>(path: string, data?: any): Promise<T> => {
    console.log(`POST ${BASE_URL}${path}`, data)

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log(`Respuesta POST ${path}:`, res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Error desconocido" }))
        console.error(`Error en POST ${path}:`, errorData)
        throw new Error(errorData.message || "Error en la petición")
      }

      const responseData = await res.json()
      console.log(`Datos de respuesta POST ${path}:`, responseData)
      return responseData
    } catch (error) {
      console.error(`Error en POST ${path}:`, error)
      throw error
    }
  },

  get: async <T = any>(path: string): Promise<T> => {
    console.log(`GET ${BASE_URL}${path}`)

    try {
      const res = await fetch(`${BASE_URL}${path}`)

      console.log(`Respuesta GET ${path}:`, res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Error desconocido" }))
        console.error(`Error en GET ${path}:`, errorData)
        throw new Error(errorData.message || "Error en la petición")
      }

      const responseData = await res.json()
      console.log(`Datos de respuesta GET ${path}:`, responseData)
      return responseData
    } catch (error) {
      console.error(`Error en GET ${path}:`, error)
      throw error
    }
  },

  patch: async <T = any>(path: string, data?: any): Promise<T> => {
    console.log(`PATCH ${BASE_URL}${path}`, data)

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log(`Respuesta PATCH ${path}:`, res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Error desconocido" }))
        console.error(`Error en PATCH ${path}:`, errorData)
        throw new Error(errorData.message || "Error en la petición")
      }

      const responseData = await res.json()
      console.log(`Datos de respuesta PATCH ${path}:`, responseData)
      return responseData
    } catch (error) {
      console.error(`Error en PATCH ${path}:`, error)
      throw error
    }
  },

  delete: async <T = any>(path: string): Promise<T> => {
    console.log(`DELETE ${BASE_URL}${path}`)

    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "DELETE",
      })

      console.log(`Respuesta DELETE ${path}:`, res.status)

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Error desconocido" }))
        console.error(`Error en DELETE ${path}:`, errorData)
        throw new Error(errorData.message || "Error en la petición")
      }

      const responseData = await res.json()
      console.log(`Datos de respuesta DELETE ${path}:`, responseData)
      return responseData
    } catch (error) {
      console.error(`Error en DELETE ${path}:`, error)
      throw error
    }
  },
}
