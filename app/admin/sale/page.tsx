"use client"

import { useState, useEffect } from "react"
import { type Sale, type SaleStats, SaleStatus, SaleType, DeliveryType } from "@/types/sale"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Package,
  MapPin,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
  Monitor,
  FileSpreadsheet,
  Filter,
  Home,
  Store,
  Phone,
  Building2,
  Navigation,
  ArrowUpDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [stats, setStats] = useState<SaleStats>({
    totalSales: 0,
    totalRevenue: 0,
    totalRevenueBob: 0,
    totalRevenueUsd: 0,
    pendingSales: 0,
    paidSales: 0,
    failedSales: 0,
    todaysSales: 0,
    todaysRevenue: 0,
    todaysRevenueBob: 0,
    todaysRevenueUsd: 0,
    qrSales: 0,
    cardSales: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [sortField, setSortField] = useState<keyof Sale>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { toast } = useToast()

  // Función para expandir nombres de departamentos
  const expandDepartmentName = (dept: string | null | undefined): string => {
    if (!dept) return ""

    const departmentMap: { [key: string]: string } = {
      // Bolivia
      cbba: "Cochabamba",
      cochabamba: "Cochabamba",
      lpz: "La Paz",
      "la paz": "La Paz",
      scz: "Santa Cruz",
      "santa cruz": "Santa Cruz",
      tarija: "Tarija",
      potosi: "Potosí",
      potosí: "Potosí",
      oruro: "Oruro",
      sucre: "Sucre",
      chuquisaca: "Chuquisaca",
      beni: "Beni",
      pando: "Pando",

      // Otros países comunes
      "buenos aires": "Buenos Aires",
      lima: "Lima",
      santiago: "Santiago",
      bogota: "Bogotá",
      bogotá: "Bogotá",
      quito: "Quito",
      caracas: "Caracas",
      asuncion: "Asunción",
      asunción: "Asunción",
      montevideo: "Montevideo",
      brasilia: "Brasilia",
      "sao paulo": "São Paulo",
      "são paulo": "São Paulo",
      "rio de janeiro": "Río de Janeiro",
      madrid: "Madrid",
      barcelona: "Barcelona",
      valencia: "Valencia",
      miami: "Miami",
      "new york": "Nueva York",
      "nueva york": "Nueva York",
      california: "California",
      texas: "Texas",
      florida: "Florida",
    }

    const normalized = dept.toLowerCase().trim()
    return departmentMap[normalized] || dept
  }

  // Función para determinar el tipo de envío y mostrar información detallada
  const getShippingInfo = (sale: Sale) => {
    if (sale.deliveryType !== DeliveryType.PHYSICAL) {
      return {
        type: "digital",
        title: "Entrega Digital",
        subtitle: "Acceso automático",
        icon: Monitor,
        color: "blue",
        description: "El cliente recibe acceso inmediato al contenido digital",
      }
    }

    const department = sale.departamento?.toLowerCase().trim() || ""
    const isCochabamba = department.includes("cochabamba") || department.includes("cbba")
    const hasAddress = sale.address && sale.address.trim() !== ""
    const fullDepartment = expandDepartmentName(sale.departamento)

    if (isCochabamba) {
      if (hasAddress) {
        return {
          type: "local_delivery",
          title: "Delivery Local - Cochabamba",
          subtitle: "Entrega a domicilio o encomienda",
          icon: Truck,
          color: "green",
          description: `Entrega local en ${fullDepartment}`,
          address: sale.address,
          country: sale.country,
        }
      } else {
        return {
          type: "pickup",
          title: "Recojo en Oficina",
          subtitle: "Cliente recoge en oficina central",
          icon: Store,
          color: "blue",
          description: "El cliente debe recoger el producto en nuestra oficina en Cochabamba",
          address: "Oficina Central - Cochabamba",
          country: sale.country,
        }
      }
    } else {
      // Otros departamentos
      if (hasAddress) {
        return {
          type: "fedex_province",
          title: `Envío FedEx a Provincia - ${fullDepartment}`,
          subtitle: "Envío directo a dirección específica",
          icon: Navigation,
          color: "purple",
          description: `Envío FedEx a provincia en ${fullDepartment}`,
          address: sale.address,
          country: sale.country,
        }
      } else {
        return {
          type: "fedex_capital",
          title: `Envío FedEx a Capital - ${fullDepartment}`,
          subtitle: "FedEx se pondrá en contacto",
          icon: Building2,
          color: "orange",
          description: `Envío a capital de ${fullDepartment}. FedEx contactará al cliente para coordinar entrega`,
          address: `Capital de ${fullDepartment}`,
          country: sale.country,
        }
      }
    }
  }

  useEffect(() => {
    fetchSales()
    // Actualizar cada 15 segundos para tiempo real
    const interval = setInterval(fetchSales, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterSales()
  }, [
    sales,
    searchTerm,
    statusFilter,
    typeFilter,
    deliveryFilter,
    paymentMethodFilter,
    activeTab,
    dateFilter,
    startDate,
    endDate,
    sortField,
    sortDirection,
  ])

  const fetchSales = async () => {
    try {
      const data = await api.get<Sale[]>("/sales")
      setSales(data)
      calculateStats(data)
      setLastUpdated(
        new Date().toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      )
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para ordenar las ventas
  const sortSales = (salesToSort: Sale[]): Sale[] => {
    return [...salesToSort].sort((a, b) => {
      let aValue = a[sortField]
      let bValue = b[sortField]
      
      // Manejo especial para fechas
      if (sortField === "createdAt") {
        aValue = new Date(aValue as string).getTime()
        bValue = new Date(bValue as string).getTime()
      }
      
      // Manejo especial para montos
      if (sortField === "amount") {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }
      
      if (aValue === undefined || bValue === undefined) return 0
      
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1
      return 0
    })
  }

  // Función para determinar si es pago QR
  const isQRPayment = (sale: Sale): boolean => {
    return !!(sale.qrReference && sale.qrReference.trim() !== "")
  }

  const calculateStats = (salesData: Sale[]) => {
    const today = new Date().toDateString()

    const qrSales = salesData.filter((sale) => isQRPayment(sale))
    const cardSales = salesData.filter((sale) => !isQRPayment(sale))

    const stats: SaleStats = {
      totalSales: salesData.length,
      totalRevenue: salesData.reduce((sum, sale) => sum + Number(sale.amount), 0),
      totalRevenueBob: qrSales.reduce((sum, sale) => sum + Number(sale.amount), 0),
      totalRevenueUsd: cardSales.reduce((sum, sale) => sum + Number(sale.amount), 0),
      pendingSales: salesData.filter((sale) => sale.status === SaleStatus.pending).length,
      paidSales: salesData.filter((sale) => sale.status === SaleStatus.paid).length,
      failedSales: salesData.filter((sale) => sale.status === SaleStatus.failed).length,
      todaysSales: salesData.filter((sale) => new Date(sale.createdAt).toDateString() === today).length,
      todaysRevenue: salesData
        .filter((sale) => new Date(sale.createdAt).toDateString() === today)
        .reduce((sum, sale) => sum + Number(sale.amount), 0),
      todaysRevenueBob: qrSales
        .filter((sale) => new Date(sale.createdAt).toDateString() === today)
        .reduce((sum, sale) => sum + Number(sale.amount), 0),
      todaysRevenueUsd: cardSales
        .filter((sale) => new Date(sale.createdAt).toDateString() === today)
        .reduce((sum, sale) => sum + Number(sale.amount), 0),
      qrSales: qrSales.length,
      cardSales: cardSales.length,
    }

    setStats(stats)
  }

  const filterByDate = (sale: Sale): boolean => {
    const saleDate = new Date(sale.createdAt)
    const today = new Date()

    switch (dateFilter) {
      case "today":
        return saleDate.toDateString() === today.toDateString()
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        return saleDate.toDateString() === yesterday.toDateString()
      case "last7days":
        const last7Days = new Date(today)
        last7Days.setDate(last7Days.getDate() - 7)
        return saleDate >= last7Days
      case "last30days":
        const last30Days = new Date(today)
        last30Days.setDate(last30Days.getDate() - 30)
        return saleDate >= last30Days
      case "thisMonth":
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear()
      case "lastMonth":
        const lastMonth = new Date(today)
        lastMonth.setMonth(lastMonth.getMonth() - 1)
        return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear()
      case "custom":
        if (startDate && endDate) {
          const start = new Date(startDate)
          const end = new Date(endDate)
          end.setHours(23, 59, 59, 999)
          return saleDate >= start && saleDate <= end
        }
        return true
      default:
        return true
    }
  }

  const filterSales = () => {
    let filtered = sales

    // Filtro por pestaña activa
    if (activeTab === "qr") {
      filtered = filtered.filter((sale) => isQRPayment(sale))
    } else if (activeTab === "card") {
      filtered = filtered.filter((sale) => !isQRPayment(sale))
    }

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (sale) =>
          sale.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.qrReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expandDepartmentName(sale.departamento)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sale.country?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtro por estado de pago
    if (statusFilter !== "all") {
      filtered = filtered.filter((sale) => sale.status === statusFilter)
    }

    // Filtro por tipo de producto/servicio
    if (typeFilter !== "all") {
      filtered = filtered.filter((sale) => sale.type === typeFilter)
    }

    // Filtro por tipo de entrega
    if (deliveryFilter !== "all") {
      filtered = filtered.filter((sale) => sale.deliveryType === deliveryFilter)
    }

    // Filtro por método de pago
    if (paymentMethodFilter !== "all") {
      if (paymentMethodFilter === "qr") {
        filtered = filtered.filter((sale) => isQRPayment(sale))
      } else if (paymentMethodFilter === "card") {
        filtered = filtered.filter((sale) => !isQRPayment(sale))
      }
    }

    // Filtro por fecha
    if (dateFilter !== "all") {
      filtered = filtered.filter(filterByDate)
    }

    // Ordenar los resultados
    filtered = sortSales(filtered)

    setFilteredSales(filtered)
  }

  const updateSaleStatus = async (saleId: number, newStatus: SaleStatus) => {
    try {
      await api.patch(`/sales/${saleId}`, { status: newStatus })
      setSales(sales.map((sale) => (sale.id === saleId ? { ...sale, status: newStatus } : sale)))
      toast({
        title: "Estado actualizado",
        description: "El estado de la venta se ha actualizado correctamente.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la venta.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (field: keyof Sale) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getSortIcon = (field: keyof Sale) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    return sortDirection === "asc" ? (
      <ArrowUpDown className="h-3 w-3 ml-1 rotate-180" />
    ) : (
      <ArrowUpDown className="h-3 w-3 ml-1" />
    )
  }

  const exportToExcel = async () => {
    setExporting(true)
    try {
      const exportData = filteredSales.map((sale, index) => {
        const isQR = isQRPayment(sale)
        const saleDate = new Date(sale.createdAt)
        const shippingInfo = getShippingInfo(sale)

        return {
          // INFORMACIÓN BÁSICA
          "N°": index + 1,
          "ID Venta": sale.id,
          Fecha: saleDate.toLocaleDateString("es-ES"),
          Hora: saleDate.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }),
          "Fecha y Hora Completa": saleDate.toLocaleString("es-ES"),

          // INFORMACIÓN DEL CLIENTE
          "Nombre Cliente": sale.user.name,
          "Email Cliente": sale.user.email,
          "Nombre Completo Facturación": sale.fullName || sale.user.name,
          Teléfono: sale.phone || "No proporcionado",

          // INFORMACIÓN DEL PRODUCTO/SERVICIO
          "Tipo de Venta": sale.type === "course" ? "Curso" : sale.type === "product" ? "Producto" : "Evento",
          "Producto/Servicio": sale.course?.title || sale.product?.name || sale.event?.title || "",
          Categoría: sale.product?.category || "N/A",
          Subcategoría: sale.product?.subCategory || "N/A",

          // INFORMACIÓN DE PAGO
          "Método de Pago": isQR ? "QR - Bolivianos (BOB)" : "Tarjeta - Dólares (USD)",
          "Monto Total": Number(sale.amount).toFixed(2),
          Moneda: isQR ? "BOB" : "USD",
          "Estado de Pago": sale.status === "paid" ? "PAGADO" : sale.status === "pending" ? "PENDIENTE" : "FALLIDO",
          "Referencia QR": sale.qrReference || "N/A",
          "ID Stripe": sale.stripePaymentIntentId || "N/A",

          // INFORMACIÓN DE ENVÍO MEJORADA
          "Tipo de Entrega": shippingInfo.title,
          "Detalle de Envío": shippingInfo.subtitle,
          "Descripción Completa": shippingInfo.description,
          País: sale.country || "",
          Departamento: expandDepartmentName(sale.departamento) || "",
          Dirección: shippingInfo.address || "No especificada",
          "Tipo de Servicio":
            shippingInfo.type === "digital"
              ? "DIGITAL"
              : shippingInfo.type === "pickup"
                ? "RECOJO EN OFICINA"
                : shippingInfo.type === "local_delivery"
                  ? "DELIVERY LOCAL"
                  : shippingInfo.type === "fedex_capital"
                    ? "FEDEX A CAPITAL"
                    : shippingInfo.type === "fedex_province"
                      ? "FEDEX A PROVINCIA"
                      : "FÍSICO",
          "Requiere Coordinación":
            shippingInfo.type === "fedex_capital"
              ? "SÍ - FedEx contactará"
              : shippingInfo.type === "pickup"
                ? "SÍ - Cliente debe recoger"
                : "NO",

          // INFORMACIÓN ADICIONAL
          Observaciones:
            shippingInfo.type === "digital"
              ? "Entrega automática digital"
              : shippingInfo.type === "pickup"
                ? "Cliente debe recoger en oficina Cochabamba"
                : shippingInfo.type === "local_delivery"
                  ? "Coordinar delivery local en Cochabamba"
                  : shippingInfo.type === "fedex_capital"
                    ? "FedEx se pondrá en contacto para coordinar entrega"
                    : shippingInfo.type === "fedex_province"
                      ? "Envío FedEx directo a dirección proporcionada"
                      : "Envío físico",
        }
      })

      if (exportData.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay ventas para exportar con los filtros aplicados.",
          variant: "destructive",
        })
        return
      }

      // Importar la biblioteca dinámicamente para reducir el bundle size
      const XLSX = await import("xlsx")

      // Crear un libro de trabajo
      const wb = XLSX.utils.book_new()

      // Crear hojas de cálculo
      const wsData = [
        // Encabezados del reporte
        [
          "REPORTE DETALLADO DE VENTAS Y ENVÍOS",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Generado el: ${new Date().toLocaleString("es-ES")}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Período: ${getDateFilterLabel()}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Total de ventas: ${filteredSales.length}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Envíos físicos: ${filteredSales.filter((sale) => sale.deliveryType === "physical").length}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Entregas digitales: ${filteredSales.filter((sale) => sale.deliveryType === "digital").length}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Recojos en oficina: ${filteredSales.filter((sale) => getShippingInfo(sale).type === "pickup").length}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Deliveries locales: ${filteredSales.filter((sale) => getShippingInfo(sale).type === "local_delivery").length}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [
          `Envíos FedEx: ${filteredSales.filter((sale) => getShippingInfo(sale).type.includes("fedex")).length}`,
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
        [], // Fila vacía
        Object.keys(exportData[0]), // Encabezados de columnas
        ...exportData.map((row) => Object.values(row)), // Datos
      ]

      // Convertir a hoja de cálculo
      const ws = XLSX.utils.aoa_to_sheet(wsData)

      // Añadir estilo a los encabezados
      if (!ws["!cols"]) ws["!cols"] = []
      const headerRow = 10 // La fila 11 (0-indexed) contiene los encabezados

      // Ajustar el ancho de las columnas automáticamente
      const range = XLSX.utils.decode_range(ws["!ref"] || "A1:Z1")
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const header = XLSX.utils.encode_col(C) + (headerRow + 1)
        if (ws[header]) {
          ws[header].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4F46E5" } }, // Color indigo-600
            alignment: { horizontal: "center" },
          }
        }

        // Establecer ancho de columna basado en el contenido
        ws["!cols"][C] = { wch: 18 } // Ancho mínimo de 18 caracteres
      }

      // Combinar celdas para el título
      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 24 } }, // Título principal
        { s: { r: 1, c: 0 }, e: { r: 1, c: 24 } }, // Fecha generación
        { s: { r: 2, c: 0 }, e: { r: 2, c: 24 } }, // Período
        { s: { r: 3, c: 0 }, e: { r: 3, c: 24 } }, // Total ventas
        { s: { r: 4, c: 0 }, e: { r: 4, c: 24 } }, // Envíos físicos
        { s: { r: 5, c: 0 }, e: { r: 5, c: 24 } }, // Entregas digitales
        { s: { r: 6, c: 0 }, e: { r: 6, c: 24 } }, // Recojos en oficina
        { s: { r: 7, c: 0 }, e: { r: 7, c: 24 } }, // Deliveries locales
        { s: { r: 8, c: 0 }, e: { r: 8, c: 24 } }, // Envíos FedEx
      ]

      // Estilo para las celdas combinadas
      ;[0, 1, 2, 3, 4, 5, 6, 7, 8].forEach((row) => {
        const cell = XLSX.utils.encode_cell({ r: row, c: 0 })
        ws[cell].s = {
          font: { bold: true, sz: row === 0 ? 16 : 12 },
          alignment: { horizontal: "center" },
        }
      })

      // Añadir la hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, "Ventas_Detalladas")

      // Generar el archivo Excel
      let fileName = `REPORTE_VENTAS_DETALLADO_${activeTab.toUpperCase()}`
      if (dateFilter !== "all") {
        fileName += `_${dateFilter.toUpperCase()}`
        if (dateFilter === "custom" && startDate && endDate) {
          fileName += `_${startDate}_${endDate}`
        }
      }
      fileName += `_${new Date().toISOString().split("T")[0]}.xlsx`

      XLSX.writeFile(wb, fileName)

      toast({
        title: "✅ Exportación exitosa",
        description: `Se exportaron ${filteredSales.length} ventas con información detallada de envíos.`,
      })
    } catch (error) {
      toast({
        title: "Error en exportación",
        description: "No se pudo exportar los datos.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.paid:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>
      case SaleStatus.pending:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>
      case SaleStatus.failed:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Fallido</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: SaleType) => {
    switch (type) {
      case SaleType.course:
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Curso
          </Badge>
        )
      case SaleType.product:
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Producto
          </Badge>
        )
      case SaleType.event:
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            Evento
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getDeliveryBadge = (deliveryType: DeliveryType) => {
    if (deliveryType === DeliveryType.DIGITAL) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Monitor className="h-3 w-3 mr-1" />
          Digital
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Truck className="h-3 w-3 mr-1" />
          Físico
        </Badge>
      )
    }
  }

  const getPaymentMethodBadge = (sale: Sale) => {
    return isQRPayment(sale) ? (
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <QrCode className="h-3 w-3 mr-1" />
        QR (BOB)
      </Badge>
    ) : (
      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
        <CreditCard className="h-3 w-3 mr-1" />
        Tarjeta (USD)
      </Badge>
    )
  }

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case "today":
        return "Hoy"
      case "yesterday":
        return "Ayer"
      case "last7days":
        return "Últimos 7 días"
      case "last30days":
        return "Últimos 30 días"
      case "thisMonth":
        return "Este mes"
      case "lastMonth":
        return "Mes pasado"
      case "custom":
        return startDate && endDate ? `${startDate} a ${endDate}` : "Rango personalizado"
      default:
        return "Todas las fechas"
    }
  }

  // Función mejorada para mostrar información de envío
  const renderShippingInfo = (sale: Sale) => {
    const shippingInfo = getShippingInfo(sale)
    const IconComponent = shippingInfo.icon

    const colorClasses = {
      blue: "text-blue-700 bg-blue-50 border-blue-200",
      green: "text-green-700 bg-green-50 border-green-200",
      purple: "text-purple-700 bg-purple-50 border-purple-200",
      orange: "text-orange-700 bg-orange-50 border-orange-200",
    }

    {filteredSales.map(sale => (
  console.log(`Venta ${sale.id}:`, {
    course: sale.course,
    product: sale.product, 
    event: sale.event
  })
))}

    return (
      <div
        className={`text-sm max-w-xs p-3 rounded-lg border ${colorClasses[shippingInfo.color as keyof typeof colorClasses]}`}
      >
        <div className="font-medium mb-2 flex items-center">
          <IconComponent className="h-4 w-4 mr-2" />
          {shippingInfo.title}
        </div>

        <div className="text-xs mb-2 opacity-80">{shippingInfo.subtitle}</div>

        {shippingInfo.country && (
          <div className="flex items-center text-xs mb-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span className="font-medium">{shippingInfo.country}</span>
          </div>
        )}

        {shippingInfo.address && shippingInfo.type !== "pickup" && (
          <div className="text-xs flex items-start ml-4">
            <Home className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
            <span className="break-words">{shippingInfo.address}</span>
          </div>
        )}

        {shippingInfo.type === "pickup" && (
          <div className="text-xs mt-2 p-2 bg-white rounded border">
            <div className="flex items-center">
              <Store className="h-3 w-3 mr-1" />
              <span className="font-medium">Oficina Central - Cochabamba</span>
            </div>
          </div>
        )}

        {shippingInfo.type === "fedex_capital" && (
          <div className="text-xs mt-2 p-2 bg-white rounded border">
            <div className="flex items-center">
              <Phone className="h-3 w-3 mr-1" />
              <span>FedEx contactará al cliente</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando datos de ventas...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
          <p className="text-gray-600">
            Monitoreo en tiempo real • Última actualización: {lastUpdated || "Cargando..."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchSales}
            disabled={loading}
            className="flex items-center bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
          <Button
            onClick={exportToExcel}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {exporting ? "Generando..." : "Exportar Excel"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Filtradas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredSales.length}</div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <QrCode className="h-3 w-3 mr-1 text-orange-600" />
                  QR:
                </span>
                <span>{filteredSales.filter((sale) => isQRPayment(sale)).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="h-3 w-3 mr-1 text-indigo-600" />
                  Tarjeta:
                </span>
                <span>{filteredSales.filter((sale) => !isQRPayment(sale)).length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos BOB</CardTitle>
            <Banknote className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              Bs{" "}
              {filteredSales
                .filter((sale) => isQRPayment(sale))
                .reduce((sum, sale) => sum + Number(sale.amount), 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Pagos con QR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos USD</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              $
              {filteredSales
                .filter((sale) => !isQRPayment(sale))
                .reduce((sum, sale) => sum + Number(sale.amount), 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Pagos con tarjeta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envíos Físicos</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredSales.filter((sale) => sale.deliveryType === DeliveryType.PHYSICAL).length}
            </div>
            <p className="text-xs text-muted-foreground">Requieren envío</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Payment Methods */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Todas las Ventas
          </TabsTrigger>
          <TabsTrigger value="qr" className="flex items-center">
            <QrCode className="h-4 w-4 mr-2" />
            Pagos QR (BOB)
          </TabsTrigger>
          <TabsTrigger value="card" className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            Pagos Tarjeta (USD)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Improved Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                Filtros de Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Búsqueda general */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">🔍 Buscar en ventas</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Cliente, producto, dirección..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Busca por nombre, email, producto o dirección</p>
                </div>

                {/* Estado de pago */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">💳 Estado de pago</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="paid">✅ Pagado</SelectItem>
                      <SelectItem value="pending">⏳ Pendiente</SelectItem>
                      <SelectItem value="failed">❌ Fallido</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Filtra por estado de pago</p>
                </div>

                {/* Tipo de producto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">📦 Tipo de producto</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="course">📚 Curso</SelectItem>
                      <SelectItem value="product">🛍️ Producto</SelectItem>
                      <SelectItem value="event">🎟️ Evento</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Filtra por tipo de producto/servicio</p>
                </div>

                {/* Tipo de entrega */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">🚚 Tipo de entrega</label>
                  <Select value={deliveryFilter} onValueChange={setDeliveryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar entrega" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="digital">💻 Digital</SelectItem>
                      <SelectItem value="physical">📦 Físico</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Filtra por tipo de entrega</p>
                </div>

                {/* Método de pago */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">💰 Método de pago</label>
                  <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Todos los métodos</SelectItem>
                      <SelectItem value="qr">📱 QR (Bolivianos)</SelectItem>
                      <SelectItem value="card">💳 Tarjeta (Dólares)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Filtra por método de pago</p>
                </div>

                {/* Filtro de fecha */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">📅 Período de tiempo</label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar período" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">Todas las fechas</SelectItem>
                      <SelectItem value="today">Hoy</SelectItem>
                      <SelectItem value="yesterday">Ayer</SelectItem>
                      <SelectItem value="last7days">Últimos 7 días</SelectItem>
                      <SelectItem value="last30days">Últimos 30 días</SelectItem>
                      <SelectItem value="thisMonth">Este mes</SelectItem>
                      <SelectItem value="lastMonth">Mes pasado</SelectItem>
                      <SelectItem value="custom">Rango personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">Filtra por fecha de venta</p>
                </div>
              </div>

              {/* Custom Date Range */}
              {dateFilter === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha de inicio</label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha de fin</label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>
                </div>
              )}

              {/* Filter Summary */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-800">
                    📊 Mostrando {filteredSales.length} de {sales.length} ventas
                  </span>
                  <span className="text-blue-600">{getDateFilterLabel()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Lista de Ventas - {activeTab === "all" ? "Todas" : activeTab === "qr" ? "QR (BOB)" : "Tarjeta (USD)"}
                </CardTitle>
                <div className="text-sm text-gray-500">Actualizado: {lastUpdated}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">
                        <button
                          onClick={() => handleSort("id")}
                          className="flex items-center hover:text-primary"
                        >
                          ID
                          {getSortIcon("id")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <button
                          onClick={() => handleSort("createdAt")}
                          className="flex items-center hover:text-primary"
                        >
                          Fecha
                          {getSortIcon("createdAt")}
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[180px]">
                        <button
                          onClick={() => handleSort("fullName")}
                          className="flex items-center hover:text-primary"
                        >
                          Cliente
                          {getSortIcon("fullName")}
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[200px]">Producto/Servicio</TableHead>
                      <TableHead className="w-[100px]">Tipo</TableHead>
                      <TableHead className="w-[120px]">Método Pago</TableHead>
                      <TableHead className="w-[100px]">
                        <button
                          onClick={() => handleSort("amount")}
                          className="flex items-center hover:text-primary"
                        >
                          Monto
                          {getSortIcon("amount")}
                        </button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <button
                          onClick={() => handleSort("status")}
                          className="flex items-center hover:text-primary"
                        >
                          Estado
                          {getSortIcon("status")}
                        </button>
                      </TableHead>
                      <TableHead className="min-w-[250px]">Información de Envío</TableHead>
                      <TableHead className="w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">#{sale.id}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{new Date(sale.createdAt).toLocaleDateString("es-ES")}</div>
                            <div className="text-gray-600">
                              {new Date(sale.createdAt).toLocaleTimeString("es-ES", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sale.fullName || sale.user.name}</div>
                            <div className="text-sm text-gray-600">{sale.user.email}</div>
                            {sale.phone && <div className="text-sm text-gray-600">{sale.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {sale.course?.title || sale.product?.name || sale.event?.title}
                          </div>
                          {sale.qrReference && (
                            <div className="text-sm text-gray-600 truncate max-w-[180px]">QR: {sale.qrReference}</div>
                          )}
                        </TableCell>
                        <TableCell>{getTypeBadge(sale.type)}</TableCell>
                        <TableCell>{getPaymentMethodBadge(sale)}</TableCell>
                        <TableCell className="font-medium">
                          {isQRPayment(sale) ? (
                            <span className="text-orange-600">Bs {Number(sale.amount).toFixed(2)}</span>
                          ) : (
                            <span className="text-indigo-600">${Number(sale.amount).toFixed(2)}</span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell>{renderShippingInfo(sale)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {sale.status === SaleStatus.pending && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateSaleStatus(sale.id, SaleStatus.paid)}
                                  className="text-green-600 hover:text-green-700"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateSaleStatus(sale.id, SaleStatus.failed)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {sale.status === SaleStatus.failed && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateSaleStatus(sale.id, SaleStatus.pending)}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <Clock className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredSales.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron ventas</h3>
                  <p className="text-gray-600">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    typeFilter !== "all" ||
                    deliveryFilter !== "all" ||
                    paymentMethodFilter !== "all" ||
                    dateFilter !== "all"
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "Aún no hay ventas registradas"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}