"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ArrowLeft, Package, MapPin, Truck, Phone, MessageCircle, Receipt, Star, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { orderService, type Order } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import OrderStatusTracker from "@/components/OrderStatusTracker"
import { formatOrderStatus, getOrderStatusColor, getOrderStatusMessage, isActiveOrderStatus } from "@/lib/order-status"

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
        if (orderData.userId !== user.uid) {
          setError("Order not found")
        } else {
          setOrder(orderData)
          setError(null)
        }
      } else {
        setError("Order not found")
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, orderId, router])

  const getEstimatedDeliveryTime = (currentOrder: Order) => {
    if (currentOrder.status === "DELIVERED" || currentOrder.status === "CANCELLED") return null

    const orderTime = currentOrder.createdAt.toDate()
    const estimatedTime = new Date(orderTime.getTime() + currentOrder.estimatedDeliveryTime * 60 * 1000)

    return estimatedTime > new Date() ? estimatedTime : null
  }

  const handleReorder = async () => {
    router.push("/menu")
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

  const isActive = isActiveOrderStatus(order.status)
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
          <div className="lg:col-span-2 space-y-6">
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
                        Est. delivery: {estimatedDelivery.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderStatusTracker currentStatus={order.status} />
                  <p className="mt-4 text-sm text-muted-foreground">{getOrderStatusMessage(order)}</p>
                </CardContent>
              </Card>
            </motion.div>

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
                        <p className="text-sm text-muted-foreground">â‚¹{item.price} each</p>
                      </div>
                      <p className="font-semibold text-primary shrink-0 neon-text">â‚¹{item.price * item.quantity}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

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

          <div className="space-y-6">
            <Card className="card-hover border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Order Status</span>
                  <Badge className={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Badge>
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
                  <span>â‚¹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>{order.deliveryFee === 0 ? "FREE" : `â‚¹${order.deliveryFee}`}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total Paid</span>
                  <span className="text-primary neon-text">â‚¹{order.finalAmount}</span>
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
