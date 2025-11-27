export type ProductAttribute = {
  id: number;
  attributeName: string;
  options: string[]; // parsed from JSON
};

export type ProductCategory = {
  id: number;
  name: string;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  code: number;
  hasAttributes: boolean;
  attributes: ProductAttribute[];
  categories: ProductCategory[];
};


interface OrderAttribute {
  attributeName: string;
  attributeValue: string;
}

export interface PreOrderItem {
  productId: number;
  attributes: OrderAttribute[];
  note?: string;
}

type OrderType = "table" | "delivery" | "pickup" | "counter";
export type OrderStatus = 'cooking' | 'packing' | 'canceled';

export interface CreateOrder {
  customerName: string;
  phone: string;
  address: string;
  orderType: OrderType
  items: PreOrderItem[];
}

export interface OrderVariant {
  note?: string | null;
  attributes: Record<string, string>; // ejemplo: { "Sopa": "Pollo" }
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  code: number;
  variants: OrderVariant[];
}

export interface Order {
  orderId: number;
  dailyOrderNumber: number;
  customerName: string;
  phone: string;
  address: string;
  createdAt: string;
  orderType: OrderType
  printed: boolean
  items: OrderItem[];
}

export interface UpdateOrder {
  customerName?: string;
  phone?: string;
  address?: string;
  orderType?: OrderType
  orderStatus?: OrderStatus
  printed?: boolean
}



 export interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  phone: string;
  roles: string[];
  createdAt: string; 
}
