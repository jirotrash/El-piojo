// Product Types
export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  image?: string;
  fotos?: string[];
  sku: string;
  stock: number;
  size?: string;
  condition?: 'excelente' | 'bueno' | 'regular';
  brand?: string;
  description?: string;
  donatedBy?: string;
  color?: string;
  sellerId?: string;
  disponible?: boolean;
  createdAt?: string;
}

export type ProductCategory = 
  | 'sudaderas'
  | 'playeras'
  | 'pantalones'
  | 'chamarras'
  | 'zapatos'
  | 'accesorios';

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'vendedor';
  matricula?: string;
  foto_perfil?: string;
}

// Donation Types
export interface Donation {
  id: string;
  items: DonationItem[];
  donorName: string;
  donorContact?: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface DonationItem {
  name: string;
  category: ProductCategory;
  size: string;
  condition: 'excelente' | 'bueno' | 'regular';
  brand?: string;
}

// Transaction Types
export interface Transaction {
  id: string;
  type: 'compra' | 'venta' | 'donacion';
  items: CartItem[];
  total: number;
  paymentMethod?: PaymentMethod;
  timestamp: Date;
  userId: string;
}

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';

// Category Icon Map
export const categoryIcons: Record<ProductCategory, string> = {
  sudaderas: 'shirt',
  playeras: 'shirt-outline',
  pantalones: 'accessibility',
  chamarras: 'snow',
  zapatos: 'footsteps',
  accesorios: 'glasses',
};

export const categoryLabels: Record<ProductCategory, string> = {
  sudaderas: 'Sudaderas',
  playeras: 'Playeras',
  pantalones: 'Pantalones',
  chamarras: 'Chamarras',
  zapatos: 'Zapatos',
  accesorios: 'Accesorios',
};

export const conditionColors: Record<string, string> = {
  excelente: '#00ff88',
  bueno: '#00d4ff',
  regular: '#ffd93d',
};
