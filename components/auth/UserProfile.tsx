"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import { User, MapPin, Phone, Package, LogOut, Edit3, Plus, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/AuthContext"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { orderService, type Order } from "@/lib/firebase-services"
import toast from "react-hot-toast"
import AddressModal from "@/components/AddressModal"
import { formatOrderStatus, getOrderStatusColor } from "@/lib/order-status"

interface UserProfileProps {
  onClose: () => void
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)

  React.useEffect(() => {
    if (!user) return

    setLoading(true)
    const unsubscribe = orderService.subscribeToUserOrders(user.uid, (orders) => {
      setRecentOrders(orders.slice(0, 3))
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Logged out successfully")
      onClose()
    } catch (error) {
      console.error(error)
      toast.error("Error logging out")
    }
  }

  if (!user) return null

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto p-4 space-y-6"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-primary" />
            </div>

            <CardTitle className="text-2xl font-heading">{userProfile?.name || "User"}</CardTitle>

            <div className="flex items-center justify-center space-x-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{userProfile?.email || user.email || "No email"}</span>
            </div>

            {userProfile?.phoneNumber && (
              <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{userProfile.phoneNumber}</span>
              </div>
            )}

            <Badge variant="secondary" className="w-fit mx-auto">
              {userProfile?.orderCount || 0} orders completed
            </Badge>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Delivery Addresses</span>
            </CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddressModal(true)}
              disabled={(userProfile?.addresses?.length || 0) >= 3}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </CardHeader>

          <CardContent className="space-y-3">
            {userProfile?.addresses?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No addresses added yet</p>
            ) : (
              userProfile?.addresses?.map((address) => (
                <div key={address.id} className="p-3 border rounded-lg flex justify-between">
                  <div>
                    <div className="flex space-x-2 mb-1">
                      <Badge variant="secondary">{address.type}</Badge>
                      {address.isDefault && <Badge>Default</Badge>}
                    </div>

                    <p className="text-sm">
                      {address.street}, {address.area}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                  </div>

                  <Edit3 className="w-4 h-4 opacity-50" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5" />
              <span>Recent Orders</span>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-3 border rounded-lg mb-2">
                  <div className="flex justify-between">
                    <Badge className={getOrderStatusColor(order.status)}>{formatOrderStatus(order.status)}</Badge>
                    <span>â‚¹{order.finalAmount}</span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items â€¢{" "}
                    {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : "Date not available"}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Separator />

        <Button variant="destructive" onClick={handleLogout} className="w-full">
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

export default UserProfile
