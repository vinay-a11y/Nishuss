"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Bike, Package, CheckCircle, Clock } from "lucide-react"

interface ScooterAnimationProps {
  status: "CONFIRMED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED"
  className?: string
}

const ScooterAnimation: React.FC<ScooterAnimationProps> = ({ status, className }) => {
  const getScooterPosition = () => {
    switch (status) {
      case "CONFIRMED":
        return "0%"
      case "PREPARING":
        return "33%"
      case "OUT_FOR_DELIVERY":
        return "66%"
      case "DELIVERED":
        return "100%"
      default:
        return "0%"
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "CONFIRMED":
        return "Order Confirmed"
      case "PREPARING":
        return "Preparing Your Order"
      case "OUT_FOR_DELIVERY":
        return "Out for Delivery"
      case "DELIVERED":
        return "Delivered!"
      case "CANCELLED":
        return "Order Cancelled"
      default:
        return "Unknown Status"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "CONFIRMED":
        return <Clock className="w-full h-full text-blue-600" />
      case "PREPARING":
        return <Package className="w-full h-full text-yellow-600" />
      case "OUT_FOR_DELIVERY":
        return <Bike className="w-full h-full text-purple-600" />
      case "DELIVERED":
        return <CheckCircle className="w-full h-full text-green-600" />
      case "CANCELLED":
        return <></> // No icon for cancelled, or a specific cancelled icon
      default:
        return <Clock className="w-full h-full text-gray-600" />
    }
  }

  if (status === "CANCELLED") {
    return null // Don't show animation for cancelled orders
  }

  return (
    <div className={`relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center ${className}`}>
      <div className="absolute w-full h-1 bg-gray-200 rounded-full top-1/2 -translate-y-1/2"></div>
      <motion.div
        className="absolute w-8 h-8 md:w-10 md:h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-md"
        initial={{ x: "0%" }}
        animate={{ x: getScooterPosition() }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        style={{ left: "-10%", transform: "translateX(-50%)" }} // Adjust initial position to be off-screen left
      >
        {getStatusIcon()}
      </motion.div>
    </div>
  )
}

export default ScooterAnimation
