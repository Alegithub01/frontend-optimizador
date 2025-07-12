"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, ShoppingCart, BookOpen, Package } from "lucide-react"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface Course {
  id: number
  nombre: string
  description?: string
  price?: number
}

interface Product {
  id: string
  title: string
  description?: string
  price?: number
}

interface User {
  id: number
  name: string
  email?: string
  country?: string // Added country field to User interface
}

interface SaleData {
  userId: number
  courseId?: number
  productId?: string
  amount: number
  type: "course" | "product"
  status: "paid"
  deliveryType: "digital"
  fullName: string
  country: string
  phone: string
}

const countries = [
  { code: "AF", name: "Afganistán", dialCode: "+93" },
  { code: "AL", name: "Albania", dialCode: "+355" },
  { code: "DE", name: "Alemania", dialCode: "+49" },
  { code: "AD", name: "Andorra", dialCode: "+376" },
  { code: "AO", name: "Angola", dialCode: "+244" },
  { code: "AI", name: "Anguila", dialCode: "+1-264" },
  { code: "AQ", name: "Antártida", dialCode: "+672" },
  { code: "AG", name: "Antigua y Barbuda", dialCode: "+1-268" },
  { code: "SA", name: "Arabia Saudita", dialCode: "+966" },
  { code: "DZ", name: "Argelia", dialCode: "+213" },
  { code: "AR", name: "Argentina", dialCode: "+54" },
  { code: "AM", name: "Armenia", dialCode: "+374" },
  { code: "AW", name: "Aruba", dialCode: "+297" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "AZ", name: "Azerbaiyán", dialCode: "+994" },
  { code: "BS", name: "Bahamas", dialCode: "+1-242" },
  { code: "BD", name: "Bangladés", dialCode: "+880" },
  { code: "BB", name: "Barbados", dialCode: "+1-246" },
  { code: "BH", name: "Baréin", dialCode: "+973" },
  { code: "BE", name: "Bélgica", dialCode: "+32" },
  { code: "BZ", name: "Belice", dialCode: "+501" },
  { code: "BJ", name: "Benín", dialCode: "+229" },
  { code: "BM", name: "Bermudas", dialCode: "+1-441" },
  { code: "BY", name: "Bielorrusia", dialCode: "+375" },
  { code: "BO", name: "Bolivia", dialCode: "+591" },
  { code: "BA", name: "Bosnia y Herzegovina", dialCode: "+387" },
  { code: "BW", name: "Botsuana", dialCode: "+267" },
  { code: "BR", name: "Brasil", dialCode: "+55" },
  { code: "BN", name: "Brunéi", dialCode: "+673" },
  { code: "BG", name: "Bulgaria", dialCode: "+359" },
  { code: "BF", name: "Burkina Faso", dialCode: "+226" },
  { code: "BI", name: "Burundi", dialCode: "+257" },
  { code: "BT", name: "Bután", dialCode: "+975" },
  { code: "CV", name: "Cabo Verde", dialCode: "+238" },
  { code: "KH", name: "Camboya", dialCode: "+855" },
  { code: "CM", name: "Camerún", dialCode: "+237" },
  { code: "CA", name: "Canadá", dialCode: "+1" },
  { code: "TD", name: "Chad", dialCode: "+235" },
  { code: "CL", name: "Chile", dialCode: "+56" },
  { code: "CN", name: "China", dialCode: "+86" },
  { code: "CY", name: "Chipre", dialCode: "+357" },
  { code: "CO", name: "Colombia", dialCode: "+57" },
  { code: "KM", name: "Comoras", dialCode: "+269" },
  { code: "CG", name: "Congo", dialCode: "+242" },
  { code: "KP", name: "Corea del Norte", dialCode: "+850" },
  { code: "KR", name: "Corea del Sur", dialCode: "+82" },
  { code: "CR", name: "Costa Rica", dialCode: "+506" },
  { code: "CI", name: "Costa de Marfil", dialCode: "+225" },
  { code: "HR", name: "Croacia", dialCode: "+385" },
  { code: "CU", name: "Cuba", dialCode: "+53" },
  { code: "DK", name: "Dinamarca", dialCode: "+45" },
  { code: "DM", name: "Dominica", dialCode: "+1-767" },
  { code: "EC", name: "Ecuador", dialCode: "+593" },
  { code: "EG", name: "Egipto", dialCode: "+20" },
  { code: "SV", name: "El Salvador", dialCode: "+503" },
  { code: "AE", name: "Emiratos Árabes Unidos", dialCode: "+971" },
  { code: "ER", name: "Eritrea", dialCode: "+291" },
  { code: "SK", name: "Eslovaquia", dialCode: "+421" },
  { code: "SI", name: "Eslovenia", dialCode: "+386" },
  { code: "ES", name: "España", dialCode: "+34" },
  { code: "US", name: "Estados Unidos", dialCode: "+1" },
  { code: "EE", name: "Estonia", dialCode: "+372" },
  { code: "ET", name: "Etiopía", dialCode: "+251" },
  { code: "FJ", name: "Fiyi", dialCode: "+679" },
  { code: "PH", name: "Filipinas", dialCode: "+63" },
  { code: "FI", name: "Finlandia", dialCode: "+358" },
  { code: "FR", name: "Francia", dialCode: "+33" },
  { code: "GA", name: "Gabón", dialCode: "+241" },
  { code: "GM", name: "Gambia", dialCode: "+220" },
  { code: "GE", name: "Georgia", dialCode: "+995" },
  { code: "GH", name: "Ghana", dialCode: "+233" },
  { code: "GI", name: "Gibraltar", dialCode: "+350" },
  { code: "GD", name: "Granada", dialCode: "+1-473" },
  { code: "GR", name: "Grecia", dialCode: "+30" },
  { code: "GL", name: "Groenlandia", dialCode: "+299" },
  { code: "GP", name: "Guadalupe", dialCode: "+590" },
  { code: "GU", name: "Guam", dialCode: "+1-671" },
  { code: "GT", name: "Guatemala", dialCode: "+502" },
  { code: "GF", name: "Guayana Francesa", dialCode: "+594" },
  { code: "GN", name: "Guinea", dialCode: "+224" },
  { code: "GQ", name: "Guinea Ecuatorial", dialCode: "+240" },
  { code: "GW", name: "Guinea-Bisáu", dialCode: "+245" },
  { code: "GY", name: "Guyana", dialCode: "+592" },
  { code: "HT", name: "Haití", dialCode: "+509" },
  { code: "HN", name: "Honduras", dialCode: "+504" },
  { code: "HK", name: "Hong Kong", dialCode: "+852" },
  { code: "HU", name: "Hungría", dialCode: "+36" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "ID", name: "Indonesia", dialCode: "+62" },
  { code: "IR", name: "Irán", dialCode: "+98" },
  { code: "IQ", name: "Irak", dialCode: "+964" },
  { code: "IE", name: "Irlanda", dialCode: "+353" },
  { code: "IS", name: "Islandia", dialCode: "+354" },
  { code: "IL", name: "Israel", dialCode: "+972" },
  { code: "IT", name: "Italia", dialCode: "+39" },
  { code: "JM", name: "Jamaica", dialCode: "+1-876" },
  { code: "JP", name: "Japón", dialCode: "+81" },
  { code: "JO", name: "Jordania", dialCode: "+962" },
  { code: "KZ", name: "Kazajistán", dialCode: "+7" },
  { code: "KE", name: "Kenia", dialCode: "+254" },
  { code: "KG", name: "Kirguistán", dialCode: "+996" },
  { code: "KI", name: "Kiribati", dialCode: "+686" },
  { code: "KW", name: "Kuwait", dialCode: "+965" },
  { code: "LA", name: "Laos", dialCode: "+856" },
  { code: "LS", name: "Lesoto", dialCode: "+266" },
  { code: "LV", name: "Letonia", dialCode: "+371" },
  { code: "LB", name: "Líbano", dialCode: "+961" },
  { code: "LR", name: "Liberia", dialCode: "+231" },
  { code: "LY", name: "Libia", dialCode: "+218" },
  { code: "LI", name: "Liechtenstein", dialCode: "+423" },
  { code: "LT", name: "Lituania", dialCode: "+370" },
  { code: "LU", name: "Luxemburgo", dialCode: "+352" },
  { code: "MO", name: "Macao", dialCode: "+853" },
  { code: "MG", name: "Madagascar", dialCode: "+261" },
  { code: "MY", name: "Malasia", dialCode: "+60" },
  { code: "MW", name: "Malaui", dialCode: "+265" },
  { code: "MV", name: "Maldivas", dialCode: "+960" },
  { code: "ML", name: "Malí", dialCode: "+223" },
  { code: "MT", name: "Malta", dialCode: "+356" },
  { code: "MA", name: "Marruecos", dialCode: "+212" },
  { code: "MQ", name: "Martinica", dialCode: "+596" },
  { code: "MU", name: "Mauricio", dialCode: "+230" },
  { code: "MR", name: "Mauritania", dialCode: "+222" },
  { code: "MX", name: "México", dialCode: "+52" },
  { code: "FM", name: "Micronesia", dialCode: "+691" },
  { code: "MD", name: "Moldavia", dialCode: "+373" },
  { code: "MC", name: "Mónaco", dialCode: "+377" },
  { code: "MN", name: "Mongolia", dialCode: "+976" },
  { code: "ME", name: "Montenegro", dialCode: "+382" },
  { code: "MS", name: "Montserrat", dialCode: "+1-664" },
  { code: "MZ", name: "Mozambique", dialCode: "+258" },
  { code: "MM", name: "Myanmar", dialCode: "+95" },
  { code: "NA", name: "Namibia", dialCode: "+264" },
  { code: "NR", name: "Nauru", dialCode: "+674" },
  { code: "NP", name: "Nepal", dialCode: "+977" },
  { code: "NI", name: "Nicaragua", dialCode: "+505" },
  { code: "NE", name: "Níger", dialCode: "+227" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "NO", name: "Noruega", dialCode: "+47" },
  { code: "NZ", name: "Nueva Zelanda", dialCode: "+64" },
  { code: "OM", name: "Omán", dialCode: "+968" },
  { code: "NL", name: "Países Bajos", dialCode: "+31" },
  { code: "PK", name: "Pakistán", dialCode: "+92" },
  { code: "PW", name: "Palaos", dialCode: "+680" },
  { code: "PA", name: "Panamá", dialCode: "+507" },
  { code: "PG", name: "Papúa Nueva Guinea", dialCode: "+675" },
  { code: "PY", name: "Paraguay", dialCode: "+595" },
  { code: "PE", name: "Perú", dialCode: "+51" },
  { code: "PN", name: "Pitcairn", dialCode: "+64" },
  { code: "PL", name: "Polonia", dialCode: "+48" },
  { code: "PT", name: "Portugal", dialCode: "+351" },
  { code: "PR", name: "Puerto Rico", dialCode: "+1-787" },
  { code: "QA", name: "Catar", dialCode: "+974" },
  { code: "GB", name: "Reino Unido", dialCode: "+44" },
  { code: "CF", name: "República Centroafricana", dialCode: "+236" },
  { code: "CZ", name: "República Checa", dialCode: "+420" },
  { code: "CD", name: "República Democrática del Congo", dialCode: "+243" },
  { code: "DO", name: "República Dominicana", dialCode: "+1-809" },
  { code: "RO", name: "Rumania", dialCode: "+40" },
  { code: "RU", name: "Rusia", dialCode: "+7" },
  { code: "RW", name: "Ruanda", dialCode: "+250" },
  { code: "EH", name: "Sahara Occidental", dialCode: "+212" },
  { code: "WS", name: "Samoa", dialCode: "+685" },
  { code: "SM", name: "San Marino", dialCode: "+378" },
  { code: "KN", name: "San Cristóbal y Nieves", dialCode: "+1-869" },
  { code: "LC", name: "Santa Lucía", dialCode: "+1-758" },
  { code: "ST", name: "Santo Tomé y Príncipe", dialCode: "+239" },
  { code: "SN", name: "Senegal", dialCode: "+221" },
  { code: "RS", name: "Serbia", dialCode: "+381" },
  { code: "SC", name: "Seychelles", dialCode: "+248" },
  { code: "SL", name: "Sierra Leona", dialCode: "+232" },
  { code: "SG", name: "Singapur", dialCode: "+65" },
  { code: "SY", name: "Siria", dialCode: "+963" },
  { code: "SO", name: "Somalia", dialCode: "+252" },
  { code: "LK", name: "Sri Lanka", dialCode: "+94" },
  { code: "SZ", name: "Suazilandia", dialCode: "+268" },
  { code: "ZA", name: "Sudáfrica", dialCode: "+27" },
  { code: "SD", name: "Sudán", dialCode: "+249" },
  { code: "SS", name: "Sudán del Sur", dialCode: "+211" },
  { code: "SE", name: "Suecia", dialCode: "+46" },
  { code: "CH", name: "Suiza", dialCode: "+41" },
  { code: "SR", name: "Surinam", dialCode: "+597" },
  { code: "TH", name: "Tailandia", dialCode: "+66" },
  { code: "TW", name: "Taiwán", dialCode: "+886" },
  { code: "TJ", name: "Tayikistán", dialCode: "+992" },
  { code: "TL", name: "Timor Oriental", dialCode: "+670" },
  { code: "TG", name: "Togo", dialCode: "+228" },
  { code: "TK", name: "Tokelau", dialCode: "+690" },
  { code: "TO", name: "Tonga", dialCode: "+676" },
  { code: "TT", name: "Trinidad y Tobago", dialCode: "+1-868" },
  { code: "TN", name: "Túnez", dialCode: "+216" },
  { code: "TR", name: "Turquía", dialCode: "+90" },
  { code: "TM", name: "Turkmenistán", dialCode: "+993" },
  { code: "TV", name: "Tuvalu", dialCode: "+688" },
  { code: "UA", name: "Ucrania", dialCode: "+380" },
  { code: "UG", name: "Uganda", dialCode: "+256" },
  { code: "UY", name: "Uruguay", dialCode: "+598" },
  { code: "UZ", name: "Uzbekistán", dialCode: "+998" },
  { code: "VU", name: "Vanuatu", dialCode: "+678" },
  { code: "VE", name: "Venezuela", dialCode: "+58" },
  { code: "VN", name: "Vietnam", dialCode: "+84" },
  { code: "YE", name: "Yemen", dialCode: "+967" },
  { code: "DJ", name: "Yibuti", dialCode: "+253" },
  { code: "ZM", name: "Zambia", dialCode: "+260" },
  { code: "ZW", name: "Zimbabue", dialCode: "+263" },
]

export default function VentasManuales() {
  const [courses, setCourses] = useState<Course[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedItem, setSelectedItem] = useState<{
    type: "course" | "product"
    id: string | number
    name: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("courses")
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    userId: 0,
    fullName: "",
    country: "",
    phone: "",
    amount: 0,
  })
  const [userSearch, setUserSearch] = useState("")
  const [debouncedUserSearch, setDebouncedUserSearch] = useState("")
  const [currentDialCode, setCurrentDialCode] = useState("")
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false) // New state for UI confirmation

  useEffect(() => {
    loadData()
  }, [])

  // Debounce effect for user search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUserSearch(userSearch)
    }, 300)
    return () => {
      clearTimeout(handler)
    }
  }, [userSearch])

  // Effect to update dial code when country changes
  useEffect(() => {
    const selectedCountry = countries.find((c) => c.code === formData.country)
    if (selectedCountry && selectedCountry.dialCode) {
      setCurrentDialCode(selectedCountry.dialCode)
      // If the phone number doesn't start with the new dial code, update it
      if (!formData.phone.startsWith(selectedCountry.dialCode)) {
        setFormData((prev) => ({ ...prev, phone: selectedCountry.dialCode }))
      }
    } else {
      setCurrentDialCode("")
      // If no country selected or no dial code, and phone starts with '+', clear it
      if (formData.phone.startsWith("+")) {
        setFormData((prev) => ({ ...prev, phone: "" }))
      }
    }
  }, [formData.country])

  const loadData = async () => {
    try {
      setLoading(true)
      const [coursesData, productsData, usersData] = await Promise.all([
        api.get<Course[]>("/courses"),
        api.get<Product[]>("/product"),
        api.get<User[]>("/users"),
      ])
      setCourses(coursesData)
      setProducts(productsData)
      setUsers(usersData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleItemSelect = (type: "course" | "product", id: string | number, name: string) => {
    setSelectedItem({ type, id, name })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedItem) {
      toast({
        title: "Error",
        description: "Selecciona un curso o producto",
        variant: "destructive",
      })
      return
    }
    if (!formData.fullName || !formData.country || !formData.phone || !formData.userId) {
      toast({
        title: "Error",
        description: "Completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }
    try {
      setSubmitting(true)
      const saleData: SaleData = {
        userId: formData.userId,
        amount: formData.amount,
        type: selectedItem.type,
        status: "paid",
        deliveryType: "digital",
        fullName: formData.fullName,
        country: formData.country,
        phone: formData.phone, // Phone number now includes dial code
      }
      if (selectedItem.type === "course") {
        saleData.courseId = selectedItem.id as number
      } else {
        saleData.productId = selectedItem.id as string
      }
      await api.post("/sales", saleData)
      toast({
        title: "¡Venta Registrada!",
        description: "La venta se ha registrado correctamente.",
        variant: "default",
      })

      // Show UI confirmation message
      setShowConfirmationMessage(true)
      setTimeout(() => {
        setShowConfirmationMessage(false)
      }, 3000) // Hide after 3 seconds

      // Reset form
      setFormData({
        userId: 0,
        fullName: "",
        country: "",
        phone: "",
        amount: 0,
      })
      setSelectedItem(null)
      setUserSearch("") // Clear user search after submission
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar la venta",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Filter users based on the debounced search term
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(debouncedUserSearch.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(debouncedUserSearch.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ventas Manuales</h1>
        <p className="text-muted-foreground">Registra ventas manuales de cursos y productos</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Selección de productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Seleccionar Producto
            </CardTitle>
            <CardDescription>Elige el curso o producto a vender</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Cursos ({courses.length})
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Productos ({products.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="courses" className="space-y-3 mt-4">
                {courses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay cursos disponibles</p>
                ) : (
                  courses.map((course) => (
                    <div
                      key={course.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedItem?.type === "course" && selectedItem?.id === course.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-border"
                      }`}
                      onClick={() => handleItemSelect("course", course.id, course.nombre)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{course.nombre}</h3>
                          {course.description && (
                            <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">Curso</Badge>
                      </div>
                      {course.price && <p className="text-sm font-medium mt-2">${course.price}</p>}
                    </div>
                  ))
                )}
              </TabsContent>
              <TabsContent value="products" className="space-y-3 mt-4">
                {products.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No hay productos disponibles</p>
                ) : (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedItem?.type === "product" && selectedItem?.id === product.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-border"
                      }`}
                      onClick={() => handleItemSelect("product", product.id, product.title)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{product.title}</h3>
                          {product.description && (
                            <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
                          )}
                        </div>
                        <Badge variant="outline">Producto</Badge>
                      </div>
                      {product.price && <p className="text-sm font-medium mt-2">${product.price}</p>}
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        {/* Formulario de venta */}
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Venta</CardTitle>
            <CardDescription>Completa la información del cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedItem && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Producto seleccionado:</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.name} ({selectedItem.type === "course" ? "Curso" : "Producto"})
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="userId">Usuario *</Label>
                <Select
                  value={formData.userId.toString()}
                  onValueChange={(value) => {
                    const selectedUserId = Number.parseInt(value)
                    const selectedUser = users.find((user) => user.id === selectedUserId)
                    setFormData((prev) => ({
                      ...prev,
                      userId: selectedUserId,
                      fullName: selectedUser?.name || prev.fullName, // Auto-fill full name
                      country: selectedUser?.country || prev.country, // Auto-fill country if available
                    }))
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {" "}
                    {/* Added bg-background here */}
                    {/* Input for user search */}
                    <div className="p-1" onPointerDownCapture={(e) => e.stopPropagation()}>
                      <Input
                        placeholder="Buscar usuario..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="mb-2"
                      />
                    </div>
                    {filteredUsers.length === 0 ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">No se encontraron usuarios.</div>
                    ) : (
                      filteredUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.name} {user.email && `(${user.email})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Nombre Completo *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un país" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {" "}
                    {/* Added bg-background here */}
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    let newValue = e.target.value
                    if (currentDialCode) {
                      // If the new value is shorter than the dial code, or doesn't start with it,
                      // reset it to just the dial code. This prevents deleting the dial code.
                      if (newValue.length < currentDialCode.length || !newValue.startsWith(currentDialCode)) {
                        newValue = currentDialCode
                      }
                    }
                    setFormData({ ...formData, phone: newValue })
                  }}
                  placeholder="Ej: +59172490992"
                  required
                />
              </div>
              {showConfirmationMessage && (
                <div className="p-3 bg-green-100 text-green-700 rounded-lg text-center font-medium">
                  ¡Venta registrada correctamente!
                </div>
              )}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-orange-700 rounded-full hover:bg-orange-600"
                  disabled={submitting || !selectedItem}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    "Registrar Venta"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
