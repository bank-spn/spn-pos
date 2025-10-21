import { create } from 'zustand';
import { CartItem, Language } from '../types';

interface AppState {
  // Language
  language: Language;
  setLanguage: (lang: Language) => void;
  
  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  
  // Cart
  cart: CartItem[];
  tableNumber: string;
  discount: number;
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateCartItem: (productId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  setTableNumber: (table: string) => void;
  setDiscount: (discount: number) => void;
  
  // PIN
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  // Language
  language: 'th',
  setLanguage: (lang) => set({ language: lang }),
  
  // Theme
  isDarkMode: false,
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  
  // Cart
  cart: [],
  tableNumber: '',
  discount: 0,
  addToCart: (item) =>
    set((state) => {
      const existingItem = state.cart.find(
        (i) => i.product.id === item.product.id
      );
      if (existingItem) {
        return {
          cart: state.cart.map((i) =>
            i.product.id === item.product.id
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  removeFromCart: (productId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    })),
  updateCartItem: (productId, updates) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, ...updates } : item
      ),
    })),
  clearCart: () => set({ cart: [], tableNumber: '', discount: 0 }),
  setTableNumber: (table) => set({ tableNumber: table }),
  setDiscount: (discount) => set({ discount }),
  
  // PIN
  isAuthenticated: false,
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
}));

