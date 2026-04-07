"use client"

import type React from "react"
import { motion } from "framer-motion"
import { CheckCircle, Clock, Package, Truck, XCircle } from "lucide-react"
import type { Order } from "@/lib/firebase-services"
import { ORDER_STATUS_FLOW, formatOrderStatus } from "@/lib/order-status"
import { cn } from "@/lib/utils"

interface OrderStatusTrackerProps {
  currentStatus: Order["status"]
}

const stageIcons = {
  CONFIRMED: Clock,
  PREPARING: Package,
  PICKUP: Package,
  DELIVERY: Truck,
  DELIVERED: CheckCircle,
} as const

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ currentStatus }) => {
  if (currentStatus === "CANCELLED") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
        <XCircle className="h-10 w-10" />
        <p className="text-lg font-semibold">Order Cancelled</p>
        <p className="text-sm">We apologize for the inconvenience.</p>
      </div>
    )
  }

  const currentStageIndex = ORDER_STATUS_FLOW.indexOf(currentStatus)

  return (
    <div className="relative mx-auto w-full max-w-3xl px-2 py-6">
      <div className="absolute left-6 right-6 top-8 h-1 rounded-full bg-gray-200">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStageIndex / (ORDER_STATUS_FLOW.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 grid grid-cols-5 gap-2">
        {ORDER_STATUS_FLOW.map((stage, index) => {
          const Icon = stageIcons[stage]

          return (
            <div key={stage} className="flex flex-col items-center text-center">
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-white transition-colors duration-300",
                  index <= currentStageIndex
                    ? "border-primary bg-primary text-black"
                    : "border-gray-300 bg-gray-100 text-gray-500",
                  index === currentStageIndex && "shadow-lg shadow-primary/30",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-medium transition-colors duration-300 sm:text-sm",
                  index <= currentStageIndex ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {formatOrderStatus(stage)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default OrderStatusTracker
