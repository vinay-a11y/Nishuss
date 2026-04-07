"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCard, MapPin, ShoppingBag, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/contexts/CartContext"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import toast from "react-hot-toast"
import Script from "next/script"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

declare global {
  interface Window {
    Razorpay: any
  }
}

const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, cartItemCount, getDeliveryFee, getFinalTotal, clearCart } = useCart()
  const { user, userProfile } = useAuth()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)
  const [activeAccordion, setActiveAccordion] = useState<string>("address")

  const defaultAddress = userProfile?.addresses?.find((addr) => addr.isDefault)

  useEffect(() => {
    if (!user) {
      toast.error("Please login to continue")
      router.push("/auth")
      return
    }

    if (cartItems.length === 0) {
      router.push("/cart")
      return
    }
  }, [user, cartItems.length, router])

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please login to continue")
      router.push("/auth")
      return
    }

    if (!defaultAddress) {
      toast.error("Please select a delivery address")
      setActiveAccordion("address")
      return
    }

    if (!razorpayLoaded) {
      toast.error("Payment system is loading. Please try again.")
      return
    }

    setIsProcessing(true)

    try {
      // Get user's ID token for authentication
      const idToken = await user.getIdToken()

      // Create Razorpay order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: getFinalTotal(),
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            userId: user.uid,
            itemCount: cartItems.length.toString(),
          },
          idToken,
        }),
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.error || "Failed to create payment order")
      }

      const { orderId, amount, currency, key } = await orderResponse.json()

      // Prepare order data for verification
      const orderData = {
        items: cartItems,
        address: defaultAddress,
        totalAmount: getFinalTotal(),
        deliveryFee: getDeliveryFee(),
        itemsTotal: cartTotal, // Using cartTotal directly
      }

      // Initialize Razorpay
      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "Biryani Adda",
        description: "Delicious Biryani Order",
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on server
            const verifyResponse = await fetch("/api/payment/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                orderData,
                idToken,
              }),
            })

            if (!verifyResponse.ok) {
              const error = await verifyResponse.json()
              throw new Error(error.error || "Payment verification failed")
            }

            const result = await verifyResponse.json()

            // Clear cart and redirect to success page
            clearCart()
            toast.success("Payment successful! Order placed.")
               router.push(`/order-success?orderId=${result.orderId}`)
           } catch (error: any) {
            console.error("Payment verification error:", error)
            toast.error(error.message || "Payment verification failed")
          } finally {
            setIsProcessing(false)
          }
        },
        prefill: {
          name: userProfile?.name || "",
          email: user.email || "",
          contact: userProfile?.phoneNumber || "",
        },
        notes: {
          address: `${defaultAddress.street}, ${defaultAddress.area}, ${defaultAddress.city}`,
        },
        theme: {
          color: "#f97316",
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            toast.error("Payment cancelled")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error: any) {
      console.error("Payment error:", error)
      toast.error(error.message || "Payment failed. Please try again.")
      setIsProcessing(false)
    }
  }

  if (!user || cartItems.length === 0) {
    return null
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error("Failed to load Razorpay SDK")
          toast.error("Payment system failed to load")
        }}
      />

      <div className="min-h-screen bg-background pt-16">
        <div className="container-custom py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-4xl font-heading font-bold"
            >
              Secure <span className="text-primary">Checkout</span>
            </motion.h1>
          </div>

          <Accordion
            type="single"
            collapsible
            value={activeAccordion}
            onValueChange={setActiveAccordion}
            className="w-full"
          >
            {/* Delivery Address Section */}
            <AccordionItem value="address" className="mb-4 rounded-lg border bg-card shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  Delivery Address
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                {defaultAddress ? (
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-primary/10 text-primary border-primary/20">{defaultAddress.type}</Badge>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    </div>
                    <p className="font-medium text-foreground">{defaultAddress.street}</p>
                    <p className="text-sm text-muted-foreground">{defaultAddress.area}</p>
                    <p className="text-sm text-muted-foreground">
                      {defaultAddress.city}, {defaultAddress.state} - {defaultAddress.pincode}
                    </p>
                    {defaultAddress.landmark && (
                      <p className="text-xs text-muted-foreground mt-1">Near: {defaultAddress.landmark}</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground mb-4">No delivery address selected</p>
                    <Button variant="outline" onClick={() => router.push("/profile")}>
                      Add Address
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Order Summary Section */}
            <AccordionItem value="summary" className="mb-4 rounded-lg border bg-card shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  Order Summary ({cartItemCount} items)
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg"}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-primary shrink-0">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between text-muted-foreground text-sm md:text-base mb-2">
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-sm md:text-base mb-2">
                    <span>Delivery Fee</span>
                    <span className="flex items-center gap-2">
                      {getDeliveryFee() === 0 ? (
                        <>
                          <Badge className="bg-green-100 text-green-700 text-xs">FREE</Badge>
                          <span className="line-through">₹40</span>
                        </>
                      ) : (
                        `₹${getDeliveryFee()}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-xl font-bold mt-4">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{getFinalTotal()}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Payment Method Section */}
            <AccordionItem value="payment" className="rounded-lg border bg-card shadow-sm">
              <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 mr-2 text-primary" />
                  Payment Method
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">Secure Online Payment</p>
                          <p className="text-sm text-muted-foreground">Powered by Razorpay</p>
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 opacity-60">
                    <p className="text-muted-foreground text-sm">💰 Cash on Delivery - Coming Soon</p>
                  </div>

                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing || !defaultAddress || !razorpayLoaded}
                    className="w-full btn-primary text-lg py-6"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing Payment...
                      </>
                    ) : !razorpayLoaded ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Loading Payment System...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay ₹{getFinalTotal()} Securely
                      </>
                    )}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground">🔒 Your payment information is secure and encrypted</p>
                    <p className="text-xs text-muted-foreground">
                      By placing this order, you agree to our Terms & Conditions
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  )
}

export default CheckoutPage
