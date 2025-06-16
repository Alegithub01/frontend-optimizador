'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, PieChart, TrendingUp, Package2 } from 'lucide-react';

export default function StatsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
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

  const categoryStats = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subCategoryStats = products.reduce((acc, product) => {
    acc[product.subCategory] = (acc[product.subCategory] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priceRanges = {
    'Menos de $25': products.filter(p => p.price < 25).length,
    '$25 - $50': products.filter(p => p.price >= 25 && p.price < 50).length,
    '$50 - $100': products.filter(p => p.price >= 50 && p.price < 100).length,
    'Más de $100': products.filter(p => p.price >= 100).length,
  };

  const stockRanges = {
    'Sin Stock (0)': products.filter(p => p.stock === 0).length,
    'Stock Bajo (1-10)': products.filter(p => p.stock > 0 && p.stock <= 10).length,
    'Stock Normal (11-50)': products.filter(p => p.stock > 10 && p.stock <= 50).length,
    'Stock Alto (50+)': products.filter(p => p.stock > 50).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
        <p className="text-gray-600">Análisis detallado de tu inventario</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{category}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(count / products.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SubCategory Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Distribución por Subcategorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(subCategoryStats).map(([subCategory, count]) => (
                <div key={subCategory} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{subCategory}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(count / products.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Ranges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Rangos de Precios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(priceRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="font-medium">{range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full" 
                        style={{ width: `${(count / products.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stock Levels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package2 className="h-5 w-5 mr-2" />
              Niveles de Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stockRanges).map(([range, count]) => (
                <div key={range} className="flex items-center justify-between">
                  <span className="font-medium">{range}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full" 
                        style={{ width: `${(count / products.length) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}