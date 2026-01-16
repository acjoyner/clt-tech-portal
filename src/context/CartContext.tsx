"use client";
import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: number;
  brand: string;
  model: string;
  price: number;
  image: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Inside CartProvider in CartContext.tsx
// Inside CartProvider
const addToCart = (item: CartItem) => {
  setCart((prev) => [...prev, item]);
  
  // We can add a simple temporary state here for a toast, 
  // but for now, let's just make sure the Navbar count works.
  console.log("Item added:", item);
};

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Define the value object explicitly
  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    total
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};