import { create } from 'zustand';
import { Product, CartItem, PaymentMethod } from '../interfaces';

interface CartStore {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  
  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  
  // Computed
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  paymentMethod: 'efectivo',

  addItem: (product: Product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        // For second-hand items, usually quantity is 1
        return state;
      }
      
      return {
        items: [...state.items, { product, quantity: 1 }],
      };
    });
  },

  removeItem: (productId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId: string, quantity: number) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ items: [] });
  },

  setPaymentMethod: (method: PaymentMethod) => {
    set({ paymentMethod: method });
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );
  },

  getTotal: () => {
    return get().getSubtotal();
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
