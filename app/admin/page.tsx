'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { Product } from '@/types/product';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  Users,
  BarChart3,
  Settings,
  ShoppingCart,
  ArrowRight,
  Crown,
  Shield
} from 'lucide-react';

const adminFeatures = [
  {
    title: 'Gestión de Productos',
    description: 'Crear, editar y eliminar productos del catálogo',
    icon: Package,
    href: '/admin/products',
    color: 'bg-blue-500',
    stats: 'productos'
  },
  {
    title: 'Gestión de Ventas',
    description: 'Monitorear ventas en tiempo real y exportar datos',
    icon: DollarSign,
    href: '/admin/sale',
    color: 'bg-green-500',
    stats: 'ventas'
  },
  {
    title: 'Gestión de Usuarios',
    description: 'Administrar usuarios y asignar roles',
    icon: Users,
    href: '/admin/users',
    color: 'bg-purple-500',
    stats: 'usuarios'
  },
  {
    title: 'Estadísticas',
    description: 'Análisis detallado del inventario y rendimiento',
    icon: BarChart3,
    href: '/admin/stats',
    color: 'bg-orange-500',
    stats: 'reportes'
  },
  {
    title: 'Ventas Manuales',
    description: 'Gestión de ventas manuales',
    icon: ShoppingCart,
    href: '/admin/ventas-manuales',
    color: 'bg-indigo-500',
    stats: 'ventas-manuales'
  },
  {
    title: 'Configuración',
    description: 'Configuración general del sistema',
    icon: Settings,
    href: '/admin/settings',
    color: 'bg-gray-500',
    stats: 'ajustes'
  }
];

const atcFeatures = [
  {
    title: 'Gestión de Ventas',
    description: 'Monitorear ventas en tiempo real y gestionar estados',
    icon: DollarSign,
    href: '/admin/sale',
    color: 'bg-green-500',
    stats: 'ventas'
  }
];

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    if (currentUser?.role === 'admin') {
      fetchProducts();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.get<Product[]>('/product');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalProducts: products.length,
    totalValue: products.reduce((sum, product) => sum + (product.price * product.stock), 0),
    averagePrice: products.length > 0 ? products.reduce((sum, product) => sum + product.price, 0) / products.length : 0,
    lowStockProducts: products.filter(product => product.stock < 10).length,
  };

  const recentProducts = products.slice(0, 5);
  const lowStockProducts = products.filter(product => product.stock < 10).slice(0, 5);

  const features = user?.role === 'admin' ? adminFeatures : atcFeatures;

  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              {user.role === 'admin' ? (
                <Crown className="h-8 w-8 text-yellow-300" />
              ) : (
                <Shield className="h-8 w-8 text-blue-300" />
              )}
              <h1 className="text-3xl font-bold">
                ¡Bienvenido, {user.name}!
              </h1>
            </div>
            <p className="text-blue-100 text-lg">
              {user.role === 'admin' 
                ? 'Panel de administración completo - Tienes acceso total al sistema'
                : 'Panel de atención al cliente - Gestiona las ventas y ayuda a los usuarios'
              }
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">Rol actual</div>
            <div className="text-2xl font-bold">
              {user.role === 'admin' ? 'ADMINISTRADOR' : 'ATC'}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link key={feature.title} href={feature.href}>
              <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg ${feature.color}`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {feature.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">
                        {feature.description}
                      </p>
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700">
                        Acceder
                        <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Admin-only Stats */}
      {user.role === 'admin' && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Resumen del Sistema</h2>
              <p className="text-gray-600">Estadísticas generales de tu tienda</p>
            </div>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">productos en inventario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">valor del inventario</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Precio Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.averagePrice.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">precio promedio</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
               <p className="text-xs text-muted-foreground">productos con stock &lt; 10</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Products */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Productos Recientes</CardTitle>
                  <Link href="/admin/products">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Todos
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentProducts.length > 0 ? (
                  <div className="space-y-4">
                    {recentProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">${product.price}</p>
                          <p className="text-xs text-gray-600">Stock: {product.stock}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No hay productos</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Stock Alert */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  Alertas de Stock
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : lowStockProducts.length > 0 ? (
                  <div className="space-y-4">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          <p className="text-xs text-gray-600">{product.author}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm text-orange-600">
                            Stock: {product.stock}
                          </p>
                          <Link href={`/admin/products/${product.id}`}>
                            <Button variant="outline" size="sm" className="mt-1">
                              Editar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                    <p>Todo el stock está bien</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}