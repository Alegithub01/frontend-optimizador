export interface ProductSection {
  title: string;
  content: string;
}

export interface Product {
  id?: string;
  name: string;
  author: string;
  price: number;
  image: string;
  stock: number;
  category: string;
  subCategory: string;
  description: string;
  sections: ProductSection[];
  trailerUrl: string;
}

export type CreateProductDto = Omit<Product, 'id'>;
export type UpdateProductDto = Partial<CreateProductDto>;