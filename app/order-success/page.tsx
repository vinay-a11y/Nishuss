"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Package,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import confetti from "canvas-confetti"
import { orderService, type Order } from "@/lib/firebase-services"
import { useAuth } from "@/contexts/AuthContext"

const OrderSuccessPage: React.FC = () => {
  const { user, loading } = useAuth() // ✅ FIXED
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")

  const [order, setOrder] = useState<Order | null>(null)
  const [pageLoading, setPageLoading] = useState(true)

  // 🚀 FIXED AUTH + NAVIGATION
  useEffect(() => {
    if (loading) return // ⛔ WAIT for Firebase auth

    if (!user) {
      router.push("/auth")
      return
    }

    if (!orderId) {
      router.push("/")
      return
    }

    loadOrder()
  }, [user, orderId, loading])

  const loadOrder = async () => {
    if (!orderId) return

    try {
      const orderData = await orderService.getOrder(orderId)

      setOrder(orderData)

      // 🎉 Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#f97316", "#fb923c", "#fdba74", "#000000"],
      })
    } catch (error) {
      console.error("Error loading order:", error)
      router.push("/")
    } finally {
      setPageLoading(false)
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-primary/10 text-primary border-primary/20"
      case "PREPARING":
        return "bg-secondary/10 text-secondary border-secondary/20"
      case "PICKUP":
        return "bg-orange-100 text-orange-700 border-orange-200"
      case "DELIVERY":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "DELIVERED":
        return "bg-green-100 text-green-700 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getEstimatedDeliveryTime = () => {
    if (!order?.createdAt?.toDate) return "N/A"

    const estimatedTime = new Date(
      order.createdAt.toDate().getTime() + 45 * 60 * 1000
    )

    return estimatedTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // ⏳ LOADING UI
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

  // ❌ NOT FOUND
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

        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-black" />
          </div>

          <h1 className="text-3xl font-bold">
            Order <span className="text-primary">Confirmed!</span>
          </h1>

          <p>Your delicious food is on the way 🚀</p>
        </div>

        {/* SUMMARY */}
        <Card className="mb-6">
          <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">

            <div>
              <p className="text-sm">Order ID</p>
              <p className="font-bold">
                #{order.id.slice(-6).toUpperCase()}
              </p>
            </div>

            <div>
              <p className="text-sm">Status</p>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>

            <div>
              <p className="text-sm">Delivery</p>
              <p>{getEstimatedDeliveryTime()}</p>
            </div>

            <div>
              <p className="text-sm">Amount</p>
              <p className="text-primary font-bold">
                ₹{order.finalAmount}
              </p>
            </div>

          </CardContent>
        </Card>

        {/* ITEMS */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-3">
            <h2 className="font-semibold flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Items
            </h2>

            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ADDRESS */}
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

        {/* ACTIONS */}
        <div className="flex flex-col gap-3">

          <Link href="/orders">
            <Button className="w-full">
              <Clock className="w-4 h-4 mr-2" />
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