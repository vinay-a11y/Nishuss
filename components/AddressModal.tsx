"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, MapPin, Trash2, Star, Home, Briefcase, MapPinIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import toast from "react-hot-toast"
import { useAuth } from "@/contexts/AuthContext"
import { userService, type Address } from "@/lib/firebase-services"

const addressSchema = z.object({
  type: z.enum(["HOME", "WORK", "OTHER"]),
  street: z.string().min(10, "Street address must be at least 10 characters"),
  area: z.string().min(2, "Area must be at least 2 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "State must be at least 2 characters"),
  pincode: z.string().regex(/^[0-9]{6}$/, "Pincode must be 6 digits"),
  landmark: z.string().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onAddressAdded?: () => void
}

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onAddressAdded }) => {
  const { user, userProfile, refreshUserProfile } = useAuth()
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      type: "HOME",
    },
  })

  const selectedType = watch("type")

  const getAddressIcon = (type: Address["type"]) => {
    switch (type) {
      case "HOME":
        return Home
      case "WORK":
        return Briefcase
      default:
        return MapPinIcon
    }
  }

  const getAddressColor = (type: Address["type"]) => {
    switch (type) {
      case "HOME":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "WORK":
        return "bg-purple-100 text-purple-700 border-purple-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const onSubmit = async (data: AddressFormData) => {
    if (!user) {
      toast.error("Please login to add address")
      return
    }

    if (userProfile?.addresses && userProfile.addresses.length >= 3) {
      toast.error("Maximum 3 addresses allowed")
      return
    }

    try {
      await userService.addAddress(user.uid, {
        ...data,
        isDefault: !userProfile?.addresses || userProfile.addresses.length === 0,
      })

      await refreshUserProfile()
      toast.success("Address added successfully!")
      reset()
      setShowAddForm(false)
      onAddressAdded?.()
    } catch (error: any) {
      toast.error(error.message || "Failed to add address")
    }
  }

  const removeAddress = async (addressId: string) => {
    if (!user) return

    try {
      setLoading(true)
      await userService.deleteAddress(user.uid, addressId)
      await refreshUserProfile()
      toast.success("Address removed successfully")
    } catch (error) {
      toast.error("Failed to remove address")
    } finally {
      setLoading(false)
    }
  }

  const setDefaultAddress = async (addressId: string) => {
    if (!user) return

    try {
      setLoading(true)
      await userService.updateAddress(user.uid, addressId, { isDefault: true })

      // Update other addresses to not be default
      if (userProfile?.addresses) {
        for (const addr of userProfile.addresses) {
          if (addr.id !== addressId && addr.isDefault) {
            await userService.updateAddress(user.uid, addr.id, { isDefault: false })
          }
        }
      }

      await refreshUserProfile()
      toast.success("Default address updated")
    } catch (error) {
      toast.error("Failed to update default address")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowAddForm(false)
    reset()
    onClose()
  }

  const addresses = userProfile?.addresses || []

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span>Manage Delivery Addresses</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <AnimatePresence>
              {addresses.map((address) => {
                const IconComponent = getAddressIcon(address.type)
                return (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all ${
                        address.isDefault
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50 hover:shadow-sm"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${getAddressColor(address.type)}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <Badge className={getAddressColor(address.type)}>{address.type}</Badge>
                                {address.isDefault && (
                                  <Badge className="ml-2 bg-primary text-primary-foreground">
                                    <Star className="w-3 h-3 mr-1" />
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-foreground">{address.street}</p>
                              <p className="text-muted-foreground">{address.area}</p>
                              <p className="text-muted-foreground">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                              {address.landmark && (
                                <p className="text-muted-foreground text-xs">Near: {address.landmark}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            {!address.isDefault && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDefaultAddress(address.id)}
                                disabled={loading}
                                className="text-xs"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAddress(address.id)}
                              disabled={loading}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>

            {addresses.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No addresses added yet</h3>
                <p className="text-muted-foreground text-sm">Add your first delivery address to get started</p>
              </div>
            )}
          </div>

          {/* Add New Address Button */}
          {!showAddForm && addresses.length < 3 && (
            <Button onClick={() => setShowAddForm(true)} className="w-full btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Add New Address
            </Button>
          )}

          {addresses.length >= 3 && !showAddForm && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <p className="text-yellow-800 text-sm">
                Maximum 3 addresses allowed. Remove an address to add a new one.
              </p>
            </div>
          )}

          {/* Add Address Form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6 border-t pt-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Plus className="w-5 h-5 text-primary" />
                  <h3 className="font-heading font-semibold text-lg">Add New Address</h3>
                </div>

                {/* Address Type */}
                <div>
                  <Label htmlFor="type">Address Type *</Label>
                  <Select value={selectedType} onValueChange={(value: any) => setValue("type", value)}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOME">
                        <div className="flex items-center space-x-2">
                          <Home className="w-4 h-4" />
                          <span>Home</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="WORK">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Work</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="OTHER">
                        <div className="flex items-center space-x-2">
                          <MapPinIcon className="w-4 h-4" />
                          <span>Other</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-destructive text-xs mt-1">{errors.type.message}</p>}
                </div>

                {/* Street Address */}
                <div>
                  <Label htmlFor="street">Street Address *</Label>
                  <Input
                    id="street"
                    {...register("street")}
                    placeholder="House no, Building, Street"
                    className="mt-1.5"
                  />
                  {errors.street && <p className="text-destructive text-xs mt-1">{errors.street.message}</p>}
                </div>

                {/* Area and Landmark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="area">Area *</Label>
                    <Input id="area" {...register("area")} placeholder="Area, Locality" className="mt-1.5" />
                    {errors.area && <p className="text-destructive text-xs mt-1">{errors.area.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="landmark">Landmark (Optional)</Label>
                    <Input id="landmark" {...register("landmark")} placeholder="Near landmark" className="mt-1.5" />
                  </div>
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" {...register("city")} placeholder="City" className="mt-1.5" />
                    {errors.city && <p className="text-destructive text-xs mt-1">{errors.city.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" {...register("state")} placeholder="State" className="mt-1.5" />
                    {errors.state && <p className="text-destructive text-xs mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      {...register("pincode")}
                      placeholder="6-digit pincode"
                      maxLength={6}
                      className="mt-1.5"
                    />
                    {errors.pincode && <p className="text-destructive text-xs mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      reset()
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1 btn-primary">
                    {isSubmitting ? "Adding..." : "Add Address"}
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddressModal
