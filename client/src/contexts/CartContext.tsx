import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { HOODIE_PRICE } from "@shared/schema";

export interface CartItem {
  id: string; // Unique identifier: `${color}-${size}`
  color: string;
  size: string;
  quantity: number;
  pricePerUnit: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (color: string, size: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "salvation-hoodie-cart";

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    // Validate that it's an array
    if (!Array.isArray(parsed)) return [];

    // Basic validation of cart items
    return parsed.filter(item =>
      item.id &&
      item.color &&
      item.size &&
      typeof item.quantity === 'number' &&
      item.quantity > 0 &&
      typeof item.pricePerUnit === 'number'
    );
  } catch (error) {
    console.error("Failed to load cart from localStorage:", error);
    return [];
  }
}

function saveCartToStorage(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const loadedCart = loadCartFromStorage();
    setItems(loadedCart);
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever items change (after initialization)
  useEffect(() => {
    if (isInitialized) {
      saveCartToStorage(items);
    }
  }, [items, isInitialized]);

  const addItem = (color: string, size: string, quantity: number) => {
    setItems(currentItems => {
      const itemId = `${color}-${size}`;
      const existingItemIndex = currentItems.findIndex(item => item.id === itemId);

      if (existingItemIndex !== -1) {
        // Item exists, update quantity (cap at 10)
        const updatedItems = [...currentItems];
        const newQuantity = Math.min(
          updatedItems[existingItemIndex].quantity + quantity,
          10
        );
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
        };
        return updatedItems;
      } else {
        // New item, add to cart
        const newItem: CartItem = {
          id: itemId,
          color,
          size,
          quantity: Math.min(quantity, 10),
          pricePerUnit: HOODIE_PRICE,
        };
        return [...currentItems, newItem];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1 || quantity > 10) return;

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.quantity * item.pricePerUnit,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
