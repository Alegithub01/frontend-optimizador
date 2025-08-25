export enum SaleType {
  course = 'course',
  product = 'product',
  event = 'event',
}

export enum DeliveryType {
  DIGITAL = 'digital',
  PHYSICAL = 'physical',
}

export enum SaleStatus {
  paid = 'paid',
  failed = 'failed',
  pending = 'pending',
}

export enum PaymentMethod {
  QR = 'qr',
  CARD = 'card',
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Course {
  id: number;
  title: string;  // Cambiado de 'name' a 'title'
  description?: string;  // Añadido porque aparece en los logs
  price: number;
  image?: string;
  trailer?: string;
  discount?: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  subCategory?: string;
}

export interface Event {
  id: number;
  title: string;  // Cambiado de 'name' a 'title'
  description?: string;
  price: number;
  date?: string;
  dateTime?: string;  // Añadido porque aparece en los logs
  endTime?: string;
  location?: string;
  image?: string;
  logo?: string;
  capacity?: number;
  // Añade otras propiedades que aparecen en los logs
}

export interface Sale {
  id: number;
  user: User;
  course?: Course;
  product?: Product;
  event?: Event;
  amount: number;
  amountBob?: number; // Monto en BOB para pagos QR
  amountUsd?: number; // Monto en USD para pagos con tarjeta
  type: SaleType;
  deliveryType: DeliveryType;
  paymentMethod: PaymentMethod; // Nuevo campo para método de pago
  departamento?: string;
  address?: string;
  stripePaymentIntentId?: string;
  status: SaleStatus;
  createdAt: string;
  qrReference?: string;
  fullName?: string;
  country?: string;
  phone?: string;
  isFree?:boolean;
}

export interface SaleStats {
  totalSales: number;
  totalRevenue: number;
  totalRevenueBob: number; // Total en BOB
  totalRevenueUsd: number; // Total en USD
  pendingSales: number;
  paidSales: number;
  failedSales: number;
  todaysSales: number;
  todaysRevenue: number;
  todaysRevenueBob: number; // Hoy en BOB
  todaysRevenueUsd: number; // Hoy en USD
  qrSales: number; // Ventas por QR
  cardSales: number; // Ventas por tarjeta
}