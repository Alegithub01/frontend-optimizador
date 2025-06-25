'use client';

import { useState, useEffect } from 'react';
import { Sale, SaleStats, SaleStatus, SaleType, DeliveryType } from '@/types/sale';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  RefreshCw,
  User,
  Package,
  MapPin,
  QrCode,
  CreditCard,
  Banknote,
  Truck,
  Monitor,
  CalendarDays,
  FileSpreadsheet,
  Filter,
  Home,
  Store
  Filter,
  Home,
  Store
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
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
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [deliveryFilter, setDeliveryFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchSales();
    // Actualizar cada 15 segundos para tiempo real
    const interval = setInterval(fetchSales, 15000);
    // Actualizar cada 15 segundos para tiempo real
    const interval = setInterval(fetchSales, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, statusFilter, typeFilter, deliveryFilter, paymentMethodFilter, activeTab, dateFilter, startDate, endDate]);

  const fetchSales = async () => {
    try {
      const data = await api.get<Sale[]>('/sales');
      setSales(data);
      calculateStats(data);
      setLastUpdated(new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
      setLastUpdated(new Date().toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las ventas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar si es pago QR
  // Función para determinar si es pago QR
  const isQRPayment = (sale: Sale): boolean => {
    return !!(sale.qrReference && sale.qrReference.trim() !== '');
  };

  const calculateStats = (salesData: Sale[]) => {
    const today = new Date().toDateString();
    
    const qrSales = salesData.filter(sale => isQRPayment(sale));
    const cardSales = salesData.filter(sale => !isQRPayment(sale));
    
    const stats: SaleStats = {
      totalSales: salesData.length,
      totalRevenue: salesData.reduce((sum, sale) => sum + Number(sale.amount), 0),
      totalRevenueBob: qrSales.reduce((sum, sale) => sum + Number(sale.amount), 0),
      totalRevenueUsd: cardSales.reduce((sum, sale) => sum + Number(sale.amount), 0),
      pendingSales: salesData.filter(sale => sale.status === SaleStatus.pending).length,
      paidSales: salesData.filter(sale => sale.status === SaleStatus.paid).length,
      failedSales: salesData.filter(sale => sale.status === SaleStatus.failed).length,
      todaysSales: salesData.filter(sale => new Date(sale.createdAt).toDateString() === today).length,
      todaysRevenue: salesData
        .filter(sale => new Date(sale.createdAt).toDateString() === today)
        .reduce((sum, sale) => sum + Number(sale.amount), 0),
      todaysRevenueBob: qrSales
        .filter(sale => new Date(sale.createdAt).toDateString() === today)
        .reduce((sum, sale) => sum + Number(sale.amount), 0),
      todaysRevenueUsd: cardSales
        .filter(sale => new Date(sale.createdAt).toDateString() === today)
        .reduce((sum, sale) => sum + Number(sale.amount), 0),
      qrSales: qrSales.length,
      cardSales: cardSales.length,
    };
    
    setStats(stats);
  };

  const filterByDate = (sale: Sale): boolean => {
    const saleDate = new Date(sale.createdAt);
    const today = new Date();
    
    switch (dateFilter) {
      case 'today':
        return saleDate.toDateString() === today.toDateString();
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return saleDate.toDateString() === yesterday.toDateString();
      case 'last7days':
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        return saleDate >= last7Days;
      case 'last30days':
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        return saleDate >= last30Days;
      case 'thisMonth':
        return saleDate.getMonth() === today.getMonth() && saleDate.getFullYear() === today.getFullYear();
      case 'lastMonth':
        const lastMonth = new Date(today);
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        return saleDate.getMonth() === lastMonth.getMonth() && saleDate.getFullYear() === lastMonth.getFullYear();
      case 'custom':
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return saleDate >= start && saleDate <= end;
        }
        return true;
      default:
        return true;
    }
  };

  const filterSales = () => {
    let filtered = sales;

    // Filtro por pestaña activa
    if (activeTab === 'qr') {
      filtered = filtered.filter(sale => isQRPayment(sale));
    } else if (activeTab === 'card') {
      filtered = filtered.filter(sale => !isQRPayment(sale));
    }

    // Filtro de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.qrReference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sale.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.event?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sale.event?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        sale.departamento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.country?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado de pago
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    // Filtro por tipo de producto/servicio
    if (typeFilter !== 'all') {
      filtered = filtered.filter(sale => sale.type === typeFilter);
    }

    // Filtro por tipo de entrega
    // Filtro por tipo de entrega
    if (deliveryFilter !== 'all') {
      filtered = filtered.filter(sale => sale.deliveryType === deliveryFilter);
    }

    // Filtro por método de pago
    if (paymentMethodFilter !== 'all') {
      if (paymentMethodFilter === 'qr') {
        filtered = filtered.filter(sale => isQRPayment(sale));
      } else if (paymentMethodFilter === 'card') {
        filtered = filtered.filter(sale => !isQRPayment(sale));
      }
    }

    // Filtro por fecha
    if (dateFilter !== 'all') {
      filtered = filtered.filter(filterByDate);
    }

    setFilteredSales(filtered);
  };

  const updateSaleStatus = async (saleId: number, newStatus: SaleStatus) => {
    try {
      await api.patch(`/sales/${saleId}`, { status: newStatus });
      setSales(sales.map(sale => 
        sale.id === saleId ? { ...sale, status: newStatus } : sale
      ));
      toast({
        title: "Estado actualizado",
        description: "El estado de la venta se ha actualizado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la venta.",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const exportData = filteredSales.map((sale, index) => {
        const isQR = isQRPayment(sale);
        const saleDate = new Date(sale.createdAt);
        
        // CORRECCIÓN: Mostrar nombre del curso/evento/producto según tipo
        const itemName = sale.type === 'course' ? sale.course?.name :
                         sale.type === 'product' ? sale.product?.name :
                         sale.type === 'event' ? sale.event?.name : '';
        
        return {
          // INFORMACIÓN BÁSICA
          'N°': index + 1,
          'ID Venta': sale.id,
          'Fecha': saleDate.toLocaleDateString('es-ES'),
          'Hora': saleDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          'Fecha y Hora Completa': saleDate.toLocaleString('es-ES'),
          
          // INFORMACIÓN DEL CLIENTE
          'Nombre Cliente': sale.user.name,
          'Email Cliente': sale.user.email,
          'Nombre Completo Facturación': sale.fullName || sale.user.name,
          'Teléfono': sale.phone || 'No proporcionado',
          
          // INFORMACIÓN DEL PRODUCTO/SERVICIO
          'Tipo de Venta': sale.type === 'course' ? 'Curso' : sale.type === 'product' ? 'Producto' : 'Evento',
          'Producto/Servicio': itemName || '',
          'Categoría': sale.product?.category || 'N/A',
          'Subcategoría': sale.product?.subCategory || 'N/A',
          
          // INFORMACIÓN DE PAGO
          'Método de Pago': isQR ? 'QR - Bolivianos (BOB)' : 'Tarjeta - Dólares (USD)',
          'Monto Total': `${isQR ? 'Bs' : '$'} ${Number(sale.amount).toFixed(2)}`,
          'Monto en BOB': isQR ? `Bs ${Number(sale.amount).toFixed(2)}` : '',
          'Monto en USD': !isQR ? `$${Number(sale.amount).toFixed(2)}` : '',
          'Estado de Pago': sale.status === 'paid' ? 'PAGADO' : sale.status === 'pending' ? 'PENDIENTE' : 'FALLIDO',
          'Referencia QR': sale.qrReference || 'N/A',
          'ID Stripe': sale.stripePaymentIntentId || 'N/A',
          
          // INFORMACIÓN DE ENVÍO
          // INFORMACIÓN DE ENVÍO
          'Tipo de Entrega': sale.deliveryType === 'physical' ? 'ENVÍO FÍSICO' : 'ENTREGA DIGITAL',
          'Requiere Envío FedEx': sale.deliveryType === 'physical' ? 'SÍ' : 'NO',
          'País': sale.country || '',
          'Departamento/Estado': sale.departamento || '',
          'Dirección Completa': sale.address || '',
          'Dirección FedEx': sale.deliveryType === 'physical' ? 
            [sale.departamento, sale.address, sale.country].filter(Boolean).join(', ') : 'No aplica',
          
          // INFORMACIÓN ADICIONAL
          'Observaciones': sale.deliveryType === 'physical' ? 'Coordinar envío con FedEx' : 'Entrega automática digital',
        };
      });

      if (exportData.length === 0) {
        toast({
          title: "Sin datos",
          description: "No hay ventas para exportar con los filtros aplicados.",
          variant: "destructive",
        });
        return;
      }

      const headers = Object.keys(exportData[0]);
      const csvContent = [
        `"REPORTE DE VENTAS - ${activeTab === 'all' ? 'TODAS LAS VENTAS' : activeTab === 'qr' ? 'PAGOS QR (BOB)' : 'PAGOS TARJETA (USD)'}"`,
        `"Generado el: ${new Date().toLocaleString('es-ES')}"`,
        `"Período: ${getDateFilterLabel()}"`,
        `"Total de ventas: ${filteredSales.length}"`,
        `"Envíos físicos: ${filteredSales.filter(sale => sale.deliveryType === 'physical').length}"`,
        `"Entregas digitales: ${filteredSales.filter(sale => sale.deliveryType === 'digital').length}"`,
        '',
        headers.map(header => `"${header}"`).join(','),
        ...exportData.map(row => 
          headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      let fileName = `REPORTE_VENTAS_${activeTab.toUpperCase()}`;
      if (dateFilter !== 'all') {
        fileName += `_${dateFilter.toUpperCase()}`;
        if (dateFilter === 'custom' && startDate && endDate) {
          fileName += `_${startDate}_${endDate}`;
        }
      }
      fileName += `_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "✅ Exportación exitosa",
        description: `Se exportaron ${filteredSales.length} ventas. ${filteredSales.filter(sale => sale.deliveryType === 'physical').length} requieren envío físico.`,
      });
    } catch (error) {
      toast({
        title: "Error en exportación",
        description: "No se pudo exportar los datos.",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: SaleStatus) => {
    switch (status) {
      case SaleStatus.paid:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Pagado</Badge>;
      case SaleStatus.pending:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendiente</Badge>;
      case SaleStatus.failed:
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Fallido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: SaleType) => {
    switch (type) {
      case SaleType.course:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Curso</Badge>;
      case SaleType.product:
        return <Badge variant="outline" className="bg-green-50 text-green-700">Producto</Badge>;
      case SaleType.event:
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Evento</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getDeliveryBadge = (deliveryType: DeliveryType) => {
    if (deliveryType === DeliveryType.DIGITAL) {
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
          <Monitor className="h-3 w-3 mr-1" />
          Digital
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Truck className="h-3 w-3 mr-1" />
          Físico
        </Badge>
      );
    }
  };

  const getPaymentMethodBadge = (sale: Sale) => {
    return isQRPayment(sale) ? 
      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
        <QrCode className="h-3 w-3 mr-1" />
        QR (BOB)
      </Badge> :
      <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100">
        <CreditCard className="h-3 w-3 mr-1" />
        Tarjeta (USD)
      </Badge>;
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Hoy';
      case 'yesterday': return 'Ayer';
      case 'last7days': return 'Últimos 7 días';
      case 'last30days': return 'Últimos 30 días';
      case 'thisMonth': return 'Este mes';
      case 'lastMonth': return 'Mes pasado';
      case 'custom': return startDate && endDate ? `${startDate} a ${endDate}` : 'Rango personalizado';
      default: return 'Todas las fechas';
    }
  };

  // Función para mostrar dirección mejorada
  const renderAddress = (sale: Sale) => {
    if (sale.deliveryType !== DeliveryType.PHYSICAL) {
      return (
        <div className="text-sm text-gray-500">
          <div className="flex items-center">
            <Monitor className="h-4 w-4 mr-1 text-blue-600" />
            <span className="font-medium">Entrega Digital</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Acceso automático
          </div>
        </div>
      );
    }

    // Si es Cochabamba y es físico, mostrar recojo en oficina
    const isCbba = sale.departamento?.toLowerCase().includes('cochabamba');
    
    return (
      <div className="text-sm max-w-xs">
        <div className="font-medium text-purple-700 mb-1 flex items-center">
          <Truck className="h-4 w-4 mr-1" />
          {isCbba ? "Recojo en oficina" : "Envío físico"}
        </div>
        
        {isCbba ? (
          <div className="bg-blue-50 p-2 rounded-md">
            <div className="flex items-center text-blue-700">
              <Store className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">Oficina Central</div>
                <div className="text-xs">Av. Simón López #1234, Zona Central</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-l-2 border-purple-200 pl-2">
            {sale.country && (
              <div className="flex items-center text-gray-700 mb-1">
                <MapPin className="h-4 w-4 mr-1 text-purple-600" />
                <span className="font-medium">{sale.country}</span>
              </div>
            )}
            {sale.departamento && (
              <div className="text-gray-600 flex items-center ml-4">
                <span>📍 {sale.departamento}</span>
              </div>
            )}
            {sale.address && (
              <div className="text-gray-600 ml-4 flex items-start">
                <Home className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span className="break-words">{sale.address}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Función para mostrar dirección mejorada
  const renderAddress = (sale: Sale) => {
    if (sale.deliveryType !== DeliveryType.PHYSICAL) {
      return (
        <div className="text-sm text-gray-500">
          <div className="flex items-center">
            <Monitor className="h-4 w-4 mr-1 text-blue-600" />
            <span className="font-medium">Entrega Digital</span>
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Acceso automático
          </div>
        </div>
      );
    }

    // Si es Cochabamba y es físico, mostrar recojo en oficina
    const isCbba = sale.departamento && 
                  (sale.departamento.toLowerCase().includes('cochabamba') || 
                   sale.departamento.toLowerCase().includes('cbba'));
    const hasAddress = sale.address && sale.address.trim() !== '';
    
    return (
      <div className="text-sm max-w-xs">
        <div className="font-medium text-purple-700 mb-1 flex items-center">
          <Truck className="h-4 w-4 mr-1" />
          {isCbba ? "Recojo en oficina" : "Envío físico"}
        </div>
        
        {isCbba ? (
          <div className="bg-blue-50 p-2 rounded-md">
            <div className="flex items-center text-blue-700">
              <Store className="h-4 w-4 mr-2" />
              <div>
                <div className="font-medium">Oficina Central</div>
                <div className="text-xs">Av. Simón López #1234, Zona Central</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-l-2 border-purple-200 pl-2">
            {sale.country && (
              <div className="flex items-center text-gray-700 mb-1">
                <MapPin className="h-4 w-4 mr-1 text-purple-600" />
                <span className="font-medium">{sale.country}</span>
              </div>
            )}
            {sale.departamento && (
              <div className="text-gray-600 flex items-center ml-4">
                <span>📍 {sale.departamento}</span>
              </div>
            )}
            {sale.address && (
              <div className="text-gray-600 ml-4 flex items-start">
                <Home className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span className="break-words">{sale.address}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando datos de ventas...</p>
        <p className="mt-4 text-gray-600">Cargando datos de ventas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Ventas</h1>
          <p className="text-gray-600">
            Monitoreo en tiempo real • Última actualización: {lastUpdated || 'Cargando...'}
          </p>
          <p className="text-gray-600">
            Monitoreo en tiempo real • Última actualización: {lastUpdated || 'Cargando...'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchSales}
            disabled={loading}
            className="flex items-center"
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            onClick={exportToExcel}
            disabled={exporting}
            className="bg-green-600 hover:bg-green-700 flex items-center"
            className="bg-green-600 hover:bg-green-700 flex items-center"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {exporting ? 'Generando...' : 'Exportar Excel'}
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
                <span>{filteredSales.filter(sale => isQRPayment(sale)).length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center">
                  <CreditCard className="h-3 w-3 mr-1 text-indigo-600" />
                  Tarjeta:
                </span>
                <span>{filteredSales.filter(sale => !isQRPayment(sale)).length}</span>
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
              Bs {filteredSales.filter(sale => isQRPayment(sale)).reduce((sum, sale) => sum + Number(sale.amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagos con QR
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos USD</CardTitle>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              ${filteredSales.filter(sale => !isQRPayment(sale)).reduce((sum, sale) => sum + Number(sale.amount), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pagos con tarjeta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Envíos Físicos</CardTitle>
            <Truck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {filteredSales.filter(sale => sale.deliveryType === DeliveryType.PHYSICAL).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren envío
            </p>
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
                    <SelectContent className='bg-white'>
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
                    <SelectContent className='bg-white'>
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
                    <SelectContent className='bg-white'>
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
                    <SelectContent className='bg-white'>
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
                    <SelectContent className='bg-white'>
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
              {dateFilter === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha de inicio</label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha de fin</label>
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Filter Summary */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-blue-800">
                    📊 Mostrando {filteredSales.length} de {sales.length} ventas
                  </span>
                  <span className="text-blue-600">
                    {getDateFilterLabel()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Lista de Ventas - {activeTab === 'all' ? 'Todas' : activeTab === 'qr' ? 'QR (BOB)' : 'Tarjeta (USD)'}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  Actualizado: {lastUpdated}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <CardTitle>
                  Lista de Ventas - {activeTab === 'all' ? 'Todas' : activeTab === 'qr' ? 'QR (BOB)' : 'Tarjeta (USD)'}
                </CardTitle>
                <div className="text-sm text-gray-500">
                  Actualizado: {lastUpdated}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead className="w-[120px]">Fecha</TableHead>
                      <TableHead className="min-w-[180px]">Cliente</TableHead>
                      <TableHead className="min-w-[200px]">Producto/Servicio</TableHead>
                      <TableHead className="w-[100px]">Tipo</TableHead>
                      <TableHead className="w-[120px]">Método Pago</TableHead>
                      <TableHead className="w-[100px]">Monto</TableHead>
                      <TableHead className="w-[120px]">Estado</TableHead>
                      <TableHead className="min-w-[200px]">Entrega</TableHead>
                      <TableHead className="w-[120px]">Acciones</TableHead>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead className="w-[120px]">Fecha</TableHead>
                      <TableHead className="min-w-[180px]">Cliente</TableHead>
                      <TableHead className="min-w-[200px]">Producto/Servicio</TableHead>
                      <TableHead className="w-[100px]">Tipo</TableHead>
                      <TableHead className="w-[120px]">Método Pago</TableHead>
                      <TableHead className="w-[100px]">Monto</TableHead>
                      <TableHead className="w-[120px]">Estado</TableHead>
                      <TableHead className="min-w-[200px]">Entrega</TableHead>
                      <TableHead className="w-[120px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">#{sale.id}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {new Date(sale.createdAt).toLocaleDateString('es-ES')}
                            </div>
                            <div className="text-gray-600">
                              {new Date(sale.createdAt).toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sale.fullName || sale.user.name}</div>
                            <div className="text-sm text-gray-600">{sale.user.email}</div>
                            {sale.phone && (
                              <div className="text-sm text-gray-600">{sale.phone}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {/* CORRECCIÓN: Mostrar nombre según tipo de venta */}
                          <div className="font-medium">
                            {sale.type === 'course' && sale.course?.name}
                            {sale.type === 'product' && sale.product?.name}
                            {sale.type === 'event' && sale.event?.name}
                          </div>
                          {sale.qrReference && (
                            <div className="text-sm text-gray-600 truncate max-w-[180px]">
                              QR: {sale.qrReference}
                            </div>
                            <div className="text-sm text-gray-600 truncate max-w-[180px]">
                              QR: {sale.qrReference}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getTypeBadge(sale.type)}</TableCell>
                        <TableCell>{getPaymentMethodBadge(sale)}</TableCell>
                        <TableCell className="font-medium">
                          {isQRPayment(sale) ? (
                            <span className="text-orange-600">
                              Bs {Number(sale.amount).toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-indigo-600">
                              ${Number(sale.amount).toFixed(2)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(sale.status)}</TableCell>
                        <TableCell>
                          {renderAddress(sale)}
                          {renderAddress(sale)}
                        </TableCell>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron ventas
                  </h3>
                  <p className="text-gray-600">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || deliveryFilter !== 'all' || paymentMethodFilter !== 'all' || dateFilter !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'Aún no hay ventas registradas'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}