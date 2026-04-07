"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { User, MapPin, Package, LogOut, Edit3, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { orderService, type Order } from "@/lib/firebase-services"
import AddressModal from "@/components/AddressModal"
import { useRouter } from "next/navigation"
import { formatOrderStatus, getOrderStatusColor } from "@/lib/order-status"

const ProfilePage: React.FC = () => {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const router = useRouter()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)

  React.useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    setLoading(true)
    const unsubscribe = orderService.subscribeToUserOrders(user.uid, (orders) => {
      setRecentOrders(orders.slice(0, 3))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user, router])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto p-4 space-y-4 md:space-y-6 pt-20 md:pt-24 min-h-screen flex flex-col"
      >
        <Card>
          <CardHeader className="text-center p-4 md:p-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <User className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-heading">{userProfile.name}</CardTitle>
            <Badge variant="secondary" className="w-fit mx-auto text-xs md:text-sm">
              {userProfile.orderCount} orders completed
            </Badge>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <MapPin className="w-4 h-4 md:w-5 md:h-5" />
              <span>Delivery Addresses</span>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddressModal(true)}
              disabled={userProfile.addresses.length >= 3}
              className="text-xs md:text-sm"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 p-4 md:p-6 pt-0">
            {userProfile.addresses.length === 0 ? (
              <p className="text-muted-foreground text-center py-3 md:py-4 text-sm">No addresses added yet</p>
            ) : (
              userProfile.addresses.map((address) => (
                <div key={address.id} className="p-3 border rounded-lg flex items-start justify-between text-sm">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={address.isDefault ? "default" : "secondary"} className="text-xs">
                        {address.type}
                      </Badge>
                      {address.isDefault && (
                        <Badge variant="outline" className="text-xs">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">
                      {address.street}, {address.area}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Package className="w-4 h-4 md:w-5 md:h-5" />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {loading ? (
              <div className="text-center py-3 md:py-4">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-3 md:py-4 text-sm">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Badge>
                      <span className="text-sm font-medium">â‚¹{order.finalAmount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)} items â€¢{" "}
                      {new Date(order.createdAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-4 md:my-6" />

        <Button variant="destructive" onClick={handleLogout} className="w-full text-base md:text-lg py-2 md:py-3">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </motion.div>

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onAddressAdded={refreshUserProfile}
      />
    </>
  )
}

export default ProfilePage
