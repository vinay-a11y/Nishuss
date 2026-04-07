"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { orderService, type Order } from "@/lib/firebase-services"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, ArrowRight } from "lucide-react"
import Link from "next/link"
import toast from "react-hot-toast"

const OrdersPage: React.FC = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading) return // ⛔ wait for auth

    if (!user) {
      router.push("/auth")
      return
    }

    loadOrders()
  }, [user, loading])

  const loadOrders = async () => {
    if (!user) return

    try {
      setPageLoading(true)

      const data = await orderService.getUserOrders(user.uid)

      setOrders(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to load orders")
    } finally {
      setPageLoading(false)
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "PREPARING":
        return "bg-yellow-100 text-yellow-800"
      case "PICKUP":
        return "bg-orange-100 text-orange-800"
      case "DELIVERY":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const safeDate = (date: any) =>
    date?.toDate ? date.toDate().toLocaleString() : "N/A"

  // ⏳ LOADING
  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your orders...</p>
      </div>
    )
  }

  // ❌ EMPTY STATE
  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Package className="w-12 h-12 text-muted-foreground" />
        <p>No orders found</p>
        <Link href="/menu">
          <Button>Order Now</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pt-20 space-y-4">

      <h1 className="text-2xl font-bold mb-4">Your Orders</h1>

      {orders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="cursor-pointer hover:shadow-lg transition"
                onClick={() => router.push(`/orders/${order.id}`)}>

            <CardContent className="p-4 space-y-2">

              {/* TOP */}
              <div className="flex justify-between items-center">
                <span className="font-semibold">
                  #{order.id.slice(-6).toUpperCase()}
                </span>

                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>

              {/* ITEMS */}
              <p className="text-sm text-muted-foreground">
                {order.items.length} items
              </p>

              {/* PRICE */}
              <p className="font-semibold text-primary">
                ₹{order.finalAmount}
              </p>

              {/* DATE */}
              <p className="text-xs text-muted-foreground">
                {safeDate(order.createdAt)}
              </p>

              {/* BUTTON */}
              <div className="flex justify-end">
                <Button size="sm" variant="ghost">
                  View Details <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </div>

            </CardContent>
          </Card>
        </motion.div>
      ))}

    </div>
  )
}

export default OrdersPage