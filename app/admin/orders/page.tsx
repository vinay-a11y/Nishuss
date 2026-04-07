"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Loader2, Package, RefreshCw, ShoppingBag } from "lucide-react"
import toast from "react-hot-toast"
import AdminNavigation from "@/components/admin/AdminNavigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { hasAdminSession, ADMIN_ORDER_STATUSES } from "@/lib/admin-auth"
import { orderService, type Order, userService, type UserProfile } from "@/lib/firebase-services"

const statusColors: Record<Order["status"], string> = {
  CONFIRMED: "bg-blue-100 text-blue-800",
  PREPARING: "bg-yellow-100 text-yellow-800",
  PICKUP: "bg-orange-100 text-orange-800",
  DELIVERY: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

const formatStatusLabel = (status: Order["status"]) => {
  switch (status) {
    case "PICKUP":
      return "Ready for Pickup"
    case "DELIVERY":
      return "Out for Delivery"
    default:
      return status.charAt(0) + status.slice(1).toLowerCase()
  }
}

const formatDate = (value: Order["createdAt"] | Order["updatedAt"]) => {
  if (!value) return "N/A"
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toLocaleString()
  }

  return new Date(value as unknown as string).toLocaleString()
}

const AdminOrdersPage: React.FC = () => {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [customerProfiles, setCustomerProfiles] = useState<Record<string, UserProfile | null>>({})
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, Order["status"]>>({})
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)

  const activeOrders = orders.filter((order) => ["CONFIRMED", "PREPARING", "PICKUP", "DELIVERY"].includes(order.status))
  const deliveredOrders = orders.filter((order) => order.status === "DELIVERED")
  const cancelledOrders = orders.filter((order) => order.status === "CANCELLED")

  const loadOrders = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const allOrders = await orderService.getAllOrders()
      setOrders(allOrders)
      setSelectedStatuses(
        Object.fromEntries(allOrders.map((order) => [order.id, order.status])) as Record<string, Order["status"]>,
      )

      const uniqueUserIds = Array.from(new Set(allOrders.map((order) => order.userId)))
      const profiles = await Promise.all(
        uniqueUserIds.map(async (userId) => {
          const profile = await userService.getUserProfile(userId)
          return [userId, profile] as const
        }),
      )

      setCustomerProfiles(Object.fromEntries(profiles))
    } catch (error) {
      console.error("Error loading admin orders:", error)
      toast.error("Failed to load admin orders")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (!hasAdminSession()) {
      router.replace("/admin")
      return
    }

    setAuthorized(true)
    loadOrders()
  }, [router])

  const handleStatusUpdate = async (orderId: string) => {
    const nextStatus = selectedStatuses[orderId]

    if (!nextStatus) {
      toast.error("Select a status first")
      return
    }

    setUpdatingOrderId(orderId)

    try {
      await orderService.updateOrderStatus(
        orderId,
        nextStatus,
        `Order status updated to ${formatStatusLabel(nextStatus).toLowerCase()}`,
      )
      toast.success("Order status updated")
      await loadOrders(true)
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("Failed to update order status")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  if (!authorized || loading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-muted-foreground">Loading admin orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container-custom py-8 space-y-8">
        <AdminNavigation
          title="Vaibhav Resto Orders"
          description="View every order and change its live fulfillment status."
          actions={
            <Button variant="outline" onClick={() => loadOrders(true)} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>Total Orders</CardDescription>
              <CardTitle className="text-3xl">{orders.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>Active Orders</CardDescription>
              <CardTitle className="text-3xl">{activeOrders.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardDescription>Delivered / Cancelled</CardDescription>
              <CardTitle className="text-3xl">
                {deliveredOrders.length} / {cancelledOrders.length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {orders.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="w-12 h-12 mx-auto mb-4 text-primary" />
              No orders available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order, index) => {
              const customer = customerProfiles[order.userId]
              const itemCount = order.items.reduce((total, item) => total + item.quantity, 0)

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <Card className="border-primary/20 shadow-sm">
                    <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <CardTitle className="text-xl">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                          <Badge className={statusColors[order.status]}>{formatStatusLabel(order.status)}</Badge>
                          <Badge variant="outline">Payment {order.paymentStatus}</Badge>
                        </div>
                        <CardDescription>
                          Placed {formatDate(order.createdAt)} | Updated {formatDate(order.updatedAt)}
                        </CardDescription>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-[220px_auto]">
                        <Select
                          value={selectedStatuses[order.id]}
                          onValueChange={(value: Order["status"]) =>
                            setSelectedStatuses((current) => ({ ...current, [order.id]: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {ADMIN_ORDER_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {formatStatusLabel(status)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={() => handleStatusUpdate(order.id)} disabled={updatingOrderId === order.id}>
                          {updatingOrderId === order.id ? "Updating..." : "Update Status"}
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="grid gap-6 lg:grid-cols-3">
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Customer</p>
                          <p className="font-semibold">{customer?.name || "Guest Customer"}</p>
                          <p className="text-sm text-muted-foreground">{customer?.email || order.userId}</p>
                          <p className="text-sm text-muted-foreground">{customer?.phoneNumber || "No phone number"}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Delivery Address</p>
                          <p className="text-sm">
                            {order.deliveryAddress.street}, {order.deliveryAddress.area}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pincode}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Order Items</p>
                        <div className="space-y-2">
                          {order.items.map((item) => (
                            <div key={`${order.id}-${item.productId}`} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <ShoppingBag className="w-4 h-4 text-primary shrink-0" />
                                <span className="truncate text-sm">{item.name}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">x{item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Summary</p>
                          <p className="text-sm">{itemCount} items</p>
                          <p className="text-sm">Items total: Rs. {order.totalAmount}</p>
                          <p className="text-sm">Delivery fee: {order.deliveryFee === 0 ? "FREE" : `Rs. ${order.deliveryFee}`}</p>
                          <p className="text-lg font-semibold text-primary">Final total: Rs. {order.finalAmount}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Latest Update</p>
                          <p className="text-sm text-muted-foreground">
                            {order.statusHistory?.[order.statusHistory.length - 1]?.message || "Order confirmed"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrdersPage
