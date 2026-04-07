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
import { formatOrderStatus, getOrderStatusColor, getOrderStatusMessage } from "@/lib/order-status"

const safeDate = (date: any) => (date?.toDate ? date.toDate().toLocaleString() : "N/A")

const OrdersPage: React.FC = () => {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [orders, setOrders] = useState<Order[]>([])
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/")
      return
    }

    setPageLoading(true)
    const unsubscribe = orderService.subscribeToUserOrders(user.uid, (data) => {
      setOrders(data)
      setPageLoading(false)
    })

    return () => unsubscribe()
  }, [user, loading, router])

  if (loading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading your orders...</p>
      </div>
    )
  }

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
          <Card className="cursor-pointer hover:shadow-lg transition" onClick={() => router.push(`/orders/${order.id}`)}>
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">#{order.id.slice(-6).toUpperCase()}</span>
                <Badge className={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
              </p>

              <p className="text-sm text-muted-foreground">{getOrderStatusMessage(order)}</p>

              <p className="font-semibold text-primary">â‚¹{order.finalAmount}</p>

              <p className="text-xs text-muted-foreground">{safeDate(order.createdAt)}</p>

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
