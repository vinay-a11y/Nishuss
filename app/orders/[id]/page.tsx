"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Package, MapPin, ArrowLeft, Phone, UtensilsCrossed, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { orderService, type Order } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import ScooterAnimation from "@/components/ScooterAnimation"

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ params }) => {
  const { id } = params
  const { user } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!id) {
      setError("Order ID is missing.")
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = orderService.subscribeToOrder(id, (fetchedOrder) => {
      if (fetchedOrder && fetchedOrder.userId === user.uid) {
        setOrder(fetchedOrder)
        setLoading(false)
      } else if (fetchedOrder && fetchedOrder.userId !== user.uid) {
        setError("You do not have permission to view this order.")
        setLoading(false)
      } else {
        setError("Order not found.")
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [id, user, router])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "PREPARING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "PICKUP":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getEstimatedDeliveryTime = (order: Order) => {
    if (order.status === "DELIVERED" || order.status === "CANCELLED") return null

    const orderTime = order.createdAt.toDate()
    const estimatedTime = new Date(orderTime.getTime() + order.estimatedDeliveryTime * 60 * 1000)

    return estimatedTime > new Date() ? estimatedTime : null
  }

  // Map status for ScooterAnimation
  const mapStatusForAnimation = (status: Order["status"]) => {
    switch (status) {
      case "DELIVERY":
        return "OUT_FOR_DELIVERY" as const
      case "PICKUP":
        return "CONFIRMED" as const // or whatever you prefer
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="font-heading font-semibold text-xl mb-2">Error</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.back()} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <UtensilsCrossed className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-xl mb-2">Order Not Found</h3>
          <p className="text-muted-foreground mb-4">The order you are looking for does not exist.</p>
          <Button onClick={() => router.back()} className="btn-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const estimatedDelivery = getEstimatedDeliveryTime(order)
  const isActiveOrder = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status)

  return (
    <div className="min-h-screen bg-background pt-16 pb-4 md:pb-8 overflow-hidden">
      <div className="container-custom px-2 md:px-4 py-4 md:py-8">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto">
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
          </Button>
          <h1 className="text-xl md:text-2xl font-heading font-bold text-center flex-1">
            Order <span className="text-primary neon-text">Details</span>
          </h1>
          <div className="w-8 md:w-10"></div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 md:space-y-6">
          {/* Order Status and Scooter Animation */}
          <Card className="card-hover">
            <CardContent className="p-4 md:p-6 flex flex-col items-center">
              <h3 className="font-heading font-semibold text-lg md:text-xl mb-2">
                Order #{order.id.slice(-8).toUpperCase()}
              </h3>
              <Badge className={`${getStatusColor(order.status)} text-sm md:text-base mb-4`}>
                {order.status.replace("_", " ")}
              </Badge>
              {isActiveOrder && (
                <div className="w-full max-w-sm">
                  <ScooterAnimation
                    status={mapStatusForAnimation(order.status)}
                    className="w-full h-20 md:h-24"
                  />
                  <p className="text-center text-sm md:text-base text-muted-foreground mt-2">
                    {order.statusHistory[order.statusHistory.length - 1]?.message || "Status update..."}
                  </p>
                </div>
              )}
              {!isActiveOrder && order.status !== "CANCELLED" && (
                <div className="text-center py-4">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-green-600">Order Delivered!</p>
                </div>
              )}
              {order.status === "CANCELLED" && (
                <div className="text-center py-4">
                  <UtensilsCrossed className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  <p className="text-lg font-semibold text-red-600">Order Cancelled</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="card-hover">
            <CardHeader className="p-4 md:p-6 pb-0">
              <CardTitle className="text-lg md:text-xl">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-2 md:space-y-3">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-muted-foreground">Order Date</span>
                <span>{order.createdAt.toDate().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-muted-foreground">Total Items</span>
                <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.totalAmount - order.deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-muted-foreground">Delivery Fee</span>
                <span>₹{order.deliveryFee}</span>
              </div>
              <div className="border-t border-border pt-2 md:pt-3 flex justify-between text-base md:text-lg font-semibold text-foreground">
                <span>Final Total</span>
                <span className="text-primary neon-text">₹{order.finalAmount}</span>
              </div>
              {estimatedDelivery && (
                <div className="bg-primary/10 text-primary p-2 rounded-lg text-xs md:text-sm border border-primary/20 text-center mt-3">
                  Estimated Delivery: {estimatedDelivery.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="card-hover">
            <CardHeader className="p-4 md:p-6 pb-0">
              <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                <span>Delivery Address</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-1 text-sm md:text-base">
              <p className="font-medium">{order.deliveryAddress.street}</p>
              <p className="text-muted-foreground">
                {order.deliveryAddress.area}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
              </p>
              {order.deliveryAddress.landmark && (
                <p className="text-xs text-muted-foreground">Near: {order.deliveryAddress.landmark}</p>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="card-hover">
            <CardHeader className="p-4 md:p-6 pb-0">
              <CardTitle className="text-lg md:text-xl">Items</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center space-x-3">
                  <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm md:text-base">{item.name}</p>
                    <p className="text-muted-foreground text-xs md:text-sm">Qty: {item.quantity}</p>
                    <p className="text-primary font-bold text-sm md:text-base">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {isActiveOrder && (
              <Button
                variant="outline"
                className="w-full border-primary/20 hover:border-primary bg-transparent text-sm md:text-base h-10"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Restaurant
              </Button>
            )}
            {order.status === "DELIVERED" && (
              <Button
                variant="outline"
                onClick={() => router.push("/menu")}
                className="w-full border-primary/20 hover:border-primary text-sm md:text-base h-10"
              >
                Order Again
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default OrderDetailsPage
