"use client"

import type React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils" // Assuming cn utility for class names

interface OrderStatusTrackerProps {
  currentStatus: "CONFIRMED" | "PREPARING" | "PICKUP" | "DELIVERY" | "DELIVERED" | "CANCELLED"
}

const statusMap = {
  CONFIRMED: 0,
  PREPARING: 1,
  PICKUP: 2,
  DELIVERY: 2, // Visually, DELIVERY is part of PICKUP stage
  DELIVERED: 3,
  CANCELLED: -1, // Special status, not part of linear progression
}

const displayStages = ["confirmed", "preparing", "picked up", "delivered"]

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  const currentStageIndex = statusMap[currentStatus]

  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg text-red-600">
        <p className="text-lg font-semibold">Order Cancelled</p>
        <p className="text-sm">We apologize for the inconvenience.</p>
      </div>
    )
  }

  return (
    <div className="relative flex items-center justify-between w-full max-w-2xl mx-auto py-8 px-4">
      {/* Progress Line */}
      <div className="absolute left-0 right-0 h-1 bg-gray-200 mx-8 rounded-full">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStageIndex / (displayStages.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Status Dots and Labels */}
      {displayStages.map((stage, index) => (
        <div key={stage} className="relative flex flex-col items-center z-10">
          <div
            className={cn(
              "w-6 h-6 rounded-full border-2 bg-white transition-colors duration-300",
              index <= currentStageIndex ? "border-primary bg-primary" : "border-gray-300 bg-gray-100",
              index === currentStageIndex && "shadow-lg shadow-primary/50", // Glowing effect for current stage
            )}
          />
          <p
            className={cn(
              "mt-2 text-sm font-medium transition-colors duration-300",
              index <= currentStageIndex ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {stage}
          </p>
        </div>
      ))}

      {/* Scooter Icon */}
      {currentStageIndex >= 0 && currentStageIndex < displayStages.length && (
        <motion.div
          className="absolute top-0 -translate-y-1/2"
          initial={{ left: "0%" }}
          animate={{ left: `${(currentStageIndex / (displayStages.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ x: "-50%" }} // Center the scooter on the dot
        >
          <Image
            src="/images/scooter.png" // Placeholder for scooter image
            alt="Delivery Scooter"
            width={60}
            height={60}
            className="drop-shadow-md"
          />
        </motion.div>
      )}
    </div>
  )
}

export default OrderStatusTracker
