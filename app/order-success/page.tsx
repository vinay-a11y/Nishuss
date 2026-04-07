"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { CheckCircle, Clock, MapPin, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import confetti from "canvas-confetti"
import { orderService, type Order } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"
import { formatOrderStatus, getOrderStatusColor, getOrderStatusMessage } from "@/lib/order-status"

const OrderSuccessPage: React.FC = () => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/")
      return
    }

    if (!orderId) {
      router.push("/")
      return
    }

    setPageLoading(true)
    const unsubscribe = orderService.subscribeToOrder(orderId, (orderData) => {
      if (orderData && orderData.userId === user.uid) {
        setOrder(orderData)
      } else {
        setOrder(null)
      }
      setPageLoading(false)
    })

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#f97316", "#fb923c", "#fdba74", "#000000"],
    })

    return () => unsubscribe()
  }, [user, orderId, loading, router])

  const getEstimatedDeliveryTime = () => {
    if (!order?.createdAt?.toDate) return "N/A"

    const estimatedTime = new Date(order.createdAt.toDate().getTime() + order.estimatedDeliveryTime * 60 * 1000)

    return estimatedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading your order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Order not found</h1>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-black" />
          </div>

          <h1 className="text-3xl font-bold">
            Order <span className="text-primary">Confirmed!</span>
          </h1>

          <p>Your delicious food is on the way.</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm">Order ID</p>
              <p className="font-bold">#{order.id.slice(-6).toUpperCase()}</p>
            </div>

            <div>
              <p className="text-sm">Status</p>
              <Badge className={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Badge>
            </div>

            <div>
              <p className="text-sm">Delivery</p>
              <p>{getEstimatedDeliveryTime()}</p>
            </div>

            <div>
              <p className="text-sm">Amount</p>
              <p className="text-primary font-bold">â‚¹{order.finalAmount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">Latest Update</h2>
            <p className="text-sm text-muted-foreground">{getOrderStatusMessage(order)}</p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Items
            </h2>

            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>{item.name} Ã— {item.quantity}</span>
                <span>â‚¹{item.price * item.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-4">
            <h2 className="font-semibold flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              Delivery Address
            </h2>

            <p>{order.deliveryAddress.street}</p>
            <p className="text-sm">
              {order.deliveryAddress.city}, {order.deliveryAddress.state}
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Link href={`/orders/${order.id}`}>
            <Button className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Track This Order
            </Button>
          </Link>

          <Link href="/orders">
            <Button variant="outline" className="w-full">
              View All Orders
            </Button>
          </Link>

          <Link href="/menu">
            <Button variant="outline" className="w-full">
              Order Again
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderSuccessPage
