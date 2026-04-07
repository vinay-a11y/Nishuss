"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  Truck,
  Phone,
  MessageCircle,
  Receipt,
  Star,
  RotateCcw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { orderService, type Order } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"

interface OrderDetailsClientPageProps {
  params: {
    id: string
  }
}

const OrderDetailsClientPage: React.FC<OrderDetailsClientPageProps> = ({ params }) => {
  const { user } = useAuth()
  const router = useRouter()
  const orderId = params.id

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    if (!orderId) {
      router.push("/orders")
      return
    }

    const unsubscribe = orderService.subscribeToOrder(orderId, (orderData) => {
      if (orderData) {
        // Verify user owns this order
        if (orderData.userId !== user?.uid) {
          setError("Order not found")
          return
        }
        setOrder(orderData)
        setError(null)
      } else {
        setError("Order not found")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, orderId, router])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-primary/10 text-primary border-primary/20"
      case "PREPARING":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "PICKUP":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "DELIVERY":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getOrderProgress = (status: Order["status"]) => {
    const steps = [
      { key: "CONFIRMED", label: "Order Confirmed", icon: CheckCircle, time: "Just now" },
      { key: "PREPARING", label: "Preparing", icon: Clock, time: "5-10 mins" },
      { key: "PICKUP", label: "Ready for Pickup", icon: Package, time: "15-20 mins" },
      { key: "DELIVERY", label: "Out for Delivery", icon: Truck, time: "20-30 mins" },
      { key: "DELIVERED", label: "Delivered", icon: CheckCircle, time: "Completed" },
    ]

    const statusOrder = ["CONFIRMED", "PREPARING", "PICKUP", "DELIVERY", "DELIVERED"]
    const currentIndex = statusOrder.indexOf(status)

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }))
  }

  const getProgressPercentage = (status: Order["status"]) => {
    const statusOrder = ["CONFIRMED", "PREPARING", "PICKUP", "DELIVERY", "DELIVERED"]
    const currentIndex = statusOrder.indexOf(status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  const getEstimatedDeliveryTime = (order: Order) => {
    if (order.status === "DELIVERED") return null
    if (order.status === "CANCELLED") return null

    const orderTime = order.createdAt.toDate()
    const estimatedTime = new Date(orderTime.getTime() + order.estimatedDeliveryTime * 60 * 1000)

    return estimatedTime > new Date() ? estimatedTime : null
  }

  const handleReorder = async () => {
    try {
      // Add items to cart and redirect to checkout
      router.push("/menu")
    } catch (error) {
      console.error("Error reordering:", error)
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

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Order not found"}</h1>
          <Button onClick={() => router.push("/orders")} className="btn-primary">
            Back to Orders
          </Button>
        </div>
      </div>
    )
  }

  const orderProgress = getOrderProgress(order.status)
  const isActive = ["CONFIRMED", "PREPARING", "PICKUP", "DELIVERY"].includes(order.status)
  const progressPercentage = getProgressPercentage(order.status)
  const estimatedDelivery = getEstimatedDeliveryTime(order)

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container-custom py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2 hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold">Order #{order.id.slice(-8).toUpperCase()}</h1>
            <p className="text-muted-foreground">
              Placed on {order.createdAt.toDate().toLocaleDateString()} at{" "}
              {order.createdAt.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2 space-y-6">
            {isActive && order.status !== "CANCELLED" && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="card-hover border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Truck className="w-5 h-5 mr-2 text-primary" />
                        Order Progress
                      </div>
                      {estimatedDelivery && (
                        <div className="text-sm text-muted-foreground">
                          Est. delivery:{" "}
                          {estimatedDelivery.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-2">{Math.round(progressPercentage)}% Complete</p>
                    </div>

                    <div className="space-y-6">
                      {orderProgress.map((step, index) => {
                        const IconComponent = step.icon
                        return (
                          <motion.div
                            key={step.key}
                            className="flex items-center space-x-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                step.completed
                                  ? "bg-primary text-black animate-glow"
                                  : step.active
                                    ? "bg-primary/20 text-primary border-2 border-primary animate-pulse"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`font-medium ${
                                  step.completed || step.active ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                {step.label}
                              </p>
                              {step.active && <p className="text-sm text-primary font-medium neon-text">In Progress</p>}
                              {step.completed && !step.active && <p className="text-sm text-green-600">Completed</p>}
                              <p className="text-xs text-muted-foreground">{step.time}</p>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Order Items */}
            <Card className="card-hover border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="w-5 h-5 mr-2 text-primary" />
                  Order Items ({order.items.reduce((sum, item) => sum + item.quantity, 0)} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={item.productId}
                      className="flex items-center space-x-4 p-3 bg-muted/50 rounded-lg border border-primary/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={item.image || "/placeholder.svg?height=64&width=64&query=biryani"}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        <p className="text-sm text-muted-foreground">₹{item.price} each</p>
                      </div>
                      <p className="font-semibold text-primary shrink-0 neon-text">₹{item.price * item.quantity}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="card-hover border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20">{order.deliveryAddress.type}</Badge>
                  </div>
                  <p className="font-medium mb-1">{order.deliveryAddress.street}</p>
                  <p className="text-sm text-muted-foreground">{order.deliveryAddress.area}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                  </p>
                  {order.deliveryAddress.landmark && (
                    <p className="text-xs text-muted-foreground mt-1">Near: {order.deliveryAddress.landmark}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-6">
            <Card className="card-hover border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Status</span>
                  <Badge className={getStatusColor(order.status)}>{order.status.replace("_", " ")}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isActive && (
                  <div className="space-y-3">
                    <Button className="w-full btn-primary animate-glow">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Restaurant
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent border-primary/20 hover:border-primary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Chat Support
                    </Button>
                  </div>
                )}

                {order.status === "DELIVERED" && (
                  <Button onClick={handleReorder} className="w-full btn-primary animate-glow">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reorder
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="card-hover border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Receipt className="w-5 h-5 mr-2 text-primary" />
                  Bill Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Items Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span className="text-primary neon-text">₹{order.finalAmount}</span>
                </div>
                <div className="text-center pt-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20">Payment {order.paymentStatus}</Badge>
                </div>
              </CardContent>
            </Card>

            {order.status === "DELIVERED" && (
              <Card className="card-hover border-primary/20 bg-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-glow">
                    <Star className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">Enjoyed your meal?</h3>
                  <p className="text-sm text-muted-foreground mb-4">Rate your experience and help us improve</p>
                  <div className="flex justify-center space-x-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} className="p-1 hover:scale-110 transition-transform">
                        <Star className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full bg-transparent border-primary/20 hover:border-primary">
                    Submit Rating
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsClientPage
