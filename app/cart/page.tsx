"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Plus, Minus, MapPin, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import AddressModal from "@/components/AddressModal"
import Image from "next/image"
import Link from "next/link"

const CartPage: React.FC = () => {
  const {
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
  } = useCart()
  const { userProfile } = useAuth()
  const [showAddressModal, setShowAddressModal] = useState(false)

  const removeItem = (id: string) => {
    removeFromCart(id)
  }

  const defaultAddress = userProfile?.addresses?.find((addr) => addr.isDefault)

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="bg-background text-foreground min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-6 neon-text">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link href="/menu">
              <Button className="btn-primary animate-glow">Browse Menu</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background text-foreground min-h-screen py-4 pt-20 md:py-8 md:pt-24 overflow-hidden">
      <div className="container mx-auto px-2 md:px-4">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-4xl font-bold mb-4 md:mb-8 text-center"
        >
          Shopping <span className="text-primary neon-text">Cart</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="bg-card border-border card-hover">
                    <CardContent className="p-3 md:p-6">
                      <div className="flex items-center space-x-2 md:space-x-4">
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-semibold text-foreground truncate">{item.name}</h3>
                          <p className="text-primary font-bold text-lg md:text-xl">₹{item.price}</p>
                        </div>

                        <div className="flex items-center space-x-2 md:space-x-3 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 md:w-8 md:h-8 p-0 border-border hover:border-primary"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>

                          <span className="w-6 md:w-8 text-center font-semibold text-sm md:text-base">
                            {item.quantity}
                          </span>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 md:w-8 md:h-8 p-0 border-border hover:border-primary"
                          >
                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="space-y-4 md:space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-card border-border card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center text-foreground text-lg md:text-xl">
                    <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2 text-primary" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {defaultAddress ? (
                    <div className="space-y-2 md:space-y-3">
                      <div className="p-2 md:p-3 bg-muted rounded-lg border border-primary/20">
                        <p className="font-semibold text-sm md:text-base text-foreground">{defaultAddress.type}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">{defaultAddress.street}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {defaultAddress.area}, {defaultAddress.city} - {defaultAddress.pincode}
                        </p>
                        {defaultAddress.landmark && (
                          <p className="text-xs text-muted-foreground">Near: {defaultAddress.landmark}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddressModal(true)}
                        className="w-full border-border text-muted-foreground hover:border-primary hover:text-primary text-xs md:text-sm"
                      >
                        Change Address
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-2 md:py-4">
                      <p className="text-muted-foreground mb-2 md:mb-3 text-sm md:text-base">
                        No delivery address selected
                      </p>
                      <Button
                        onClick={() => setShowAddressModal(true)}
                        className="btn-primary animate-glow text-sm md:text-base"
                      >
                        Add Address
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-card border-border card-hover">
                <CardHeader>
                  <CardTitle className="text-foreground text-lg md:text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4">
                  <div className="flex justify-between text-muted-foreground text-sm md:text-base">
                    <span>Subtotal</span>
                    <span>₹{getTotalPrice()}</span>
                  </div>

                  <div className="flex justify-between text-muted-foreground text-sm md:text-base">
                    <span>Delivery Fee</span>
                    <span className="flex items-center gap-1 md:gap-2">
                      {getDeliveryFee() === 0 ? (
                        <>
                          <Badge className="bg-primary text-primary-foreground text-xs animate-pulse-orange">
                            FREE
                          </Badge>
                          <span className="line-through">₹40</span>
                        </>
                      ) : (
                        `₹${getDeliveryFee()}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 md:pt-4">
                    <div className="flex justify-between text-base md:text-lg font-semibold text-foreground">
                      <span>Total</span>
                      <span className="text-primary neon-text">₹{getFinalTotal()}</span>
                    </div>
                  </div>

                  {getDeliveryFee() === 0 && (
                    <div className="bg-primary/10 text-primary p-2 md:p-3 rounded-lg text-xs md:text-sm border border-primary/20">
                      🎉 You're getting FREE delivery! ({5 - cartItemCount} orders remaining)
                    </div>
                  )}

                  <Link href="/checkout">
                    <Button
                      className="w-full btn-primary text-base md:text-lg py-2 md:py-3 animate-glow"
                      disabled={!defaultAddress}
                    >
                      <CreditCard className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>

                  {!defaultAddress && (
                    <p className="text-xs text-muted-foreground text-center">
                      Please add a delivery address to continue
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <AddressModal isOpen={showAddressModal} onClose={() => setShowAddressModal(false)} />
    </div>
  )
}

export default CartPage
