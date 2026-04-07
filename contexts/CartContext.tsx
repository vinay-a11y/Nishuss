"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner" // Assuming sonner for toasts
import { useAuth } from "@/contexts/AuthContext" // Import useAuth to get user profile

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartItemCount: number
  getTotalPrice: () => number
  getDeliveryFee: () => number
  getFinalTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { userProfile } = useAuth() // Access userProfile from AuthContext

  useEffect(() => {
    // Load cart from localStorage on mount
    const storedCart = localStorage.getItem("biryani_cart")
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
  }, [])

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("biryani_cart", JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (item: CartItem) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === item.id)
      if (existingItem) {
        toast.success(`Updated quantity for ${item.name}`)
        return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
      } else {
        toast.success(`${item.name} added to cart!`)
        return [...prevItems, item]
      }
    })
  }

  const removeFromCart = (itemId: string) => {
    setCartItems((prevItems) => {
      const removedItem = prevItems.find((i) => i.id === itemId)
      if (removedItem) {
        toast.info(`${removedItem.name} removed from cart.`)
      }
      return prevItems.filter((item) => item.id !== itemId)
    })
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== itemId)
      }
      return prevItems.map((item) => (item.id === itemId ? { ...item, quantity: quantity } : item))
    })
  }

  const clearCart = () => {
    setCartItems([])
    toast.info("Cart cleared.")
  }

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  const getTotalPrice = () => {
    return cartTotal
  }

  const getDeliveryFee = () => {
    const orderCount = userProfile?.orderCount || 0
    if (orderCount < 5) {
      return 0 // Free delivery for the first 5 orders
    }
    return 40 // ₹40 delivery charge after 5 orders
  }

  const getFinalTotal = () => {
    return getTotalPrice() + getDeliveryFee()
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartItemCount,
        getTotalPrice,
        getDeliveryFee,
        getFinalTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
