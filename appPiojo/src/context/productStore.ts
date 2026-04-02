import { create } from 'zustand';
import { Product } from '../interfaces';

interface ProductStore {
  selected: Product | null;
  setSelected: (product: Product) => void;
  clear: () => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  selected: null,
  setSelected: (product) => set({ selected: product }),
  clear: () => set({ selected: null }),
}));
