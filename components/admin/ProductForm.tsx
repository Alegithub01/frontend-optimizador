'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductSection } from '@/types/product';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

const CATEGORIES = [
  { value: 'libro', label: 'Libro' },
  { value: 'revista', label: 'Revista' },
  { value: 'toolkit', label: 'Toolkit' }
];

const TOOLKIT_SUBCATEGORIES = [
  { value: 'energia', label: 'Energía' },
  { value: 'alimentacion', label: 'Alimentación' },
  { value: 'meditacion', label: 'Meditación' },
  { value: 'negocio', label: 'Negocio' }
];

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    author: product?.author || '',
    price: product?.price || 0,
    image: product?.image || '',
    stock: product?.stock || 0,
    category: product?.category || '',
    subCategory: product?.subCategory || '',
    description: product?.description || '',
    sections: product?.sections || [],
    trailerUrl: product?.trailerUrl || '',
  });

  const handleInputChange = (field: keyof Product, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({
      ...prev,
      category,
      subCategory: '' // Reset subcategory when category changes
    }));
  };

  const handleSectionChange = (index: number, field: keyof ProductSection, value: string) => {
    const newSections = [...(formData.sections || [])];
    newSections[index] = {
      ...newSections[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      sections: newSections
    }));
  };

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...(prev.sections || []), { title: '', content: '' }]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && product?.id) {
        await api.patch(`/product/${product.id}`, formData);
        toast({
          title: "Producto actualizado",
          description: "El producto se ha actualizado correctamente.",
        });
      } else {
        await api.post('/product', formData);
        toast({
          title: "Producto creado",
          description: "El producto se ha creado correctamente.",
        });
      }
      router.push('/admin/products');
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al guardar el producto.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isToolkit = formData.category === 'toolkit';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? 'Editar Producto' : 'Crear Producto'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ingresa el nombre del producto"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="Nombre del autor"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', parseInt(e.target.value))}
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Subcategoría solo aparece si es toolkit */}
            {isToolkit && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subCategory">Subcategoría</Label>
                  <Select 
                    value={formData.subCategory} 
                    onValueChange={(value) => handleInputChange('subCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una subcategoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOOLKIT_SUBCATEGORIES.map((subCategory) => (
                        <SelectItem key={subCategory.value} value={subCategory.value}>
                          {subCategory.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">URL de Imagen</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
              </div>
            )}

            {/* Para libro y revista, imagen va en la fila normal */}
            {!isToolkit && (
              <div className="space-y-2">
                <Label htmlFor="image">URL de Imagen</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleInputChange('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="trailerUrl">URL del Trailer</Label>
              <Input
                id="trailerUrl"
                value={formData.trailerUrl}
                onChange={(e) => handleInputChange('trailerUrl', e.target.value)}
                placeholder="https://example.com/trailer.mp4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el producto en detalle..."
                rows={4}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Secciones del Producto</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Sección
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {formData.sections && formData.sections.length > 0 ? (
              <div className="space-y-4">
                {formData.sections.map((section, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        Sección {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeSection(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label>Título de la Sección</Label>
                        <Input
                          value={section.title}
                          onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                          placeholder="Título de la sección"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Contenido</Label>
                        <Textarea
                          value={section.content}
                          onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                          placeholder="Contenido de la sección"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium">No hay secciones agregadas</p>
                <p className="text-sm">Haz clic en "Agregar Sección" para comenzar</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
          </Button>
        </div>
      </form>
    </div>
  );
}