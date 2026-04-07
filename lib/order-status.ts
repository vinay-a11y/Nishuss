import type { Order } from "@/lib/firebase-services"

type OrderStatus = Order["status"]

export const ORDER_STATUS_FLOW: Exclude<OrderStatus, "CANCELLED">[] = [
  "CONFIRMED",
  "PREPARING",
  "PICKUP",
  "DELIVERY",
  "DELIVERED",
]

export const formatOrderStatus = (status: OrderStatus) => {
  switch (status) {
    case "CONFIRMED":
      return "Confirmed"
    case "PREPARING":
      return "Preparing"
    case "PICKUP":
      return "Ready for Pickup"
    case "DELIVERY":
      return "Out for Delivery"
    case "DELIVERED":
      return "Delivered"
    case "CANCELLED":
      return "Cancelled"
    default:
      return status
  }
}

export const getOrderStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "PREPARING":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "PICKUP":
      return "bg-orange-100 text-orange-800 border-orange-200"
    case "DELIVERY":
      return "bg-purple-100 text-purple-800 border-purple-200"
    case "DELIVERED":
      return "bg-green-100 text-green-800 border-green-200"
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

export const isActiveOrderStatus = (status: OrderStatus) =>
  ["CONFIRMED", "PREPARING", "PICKUP", "DELIVERY"].includes(status)

export const getOrderStatusMessage = (order: Pick<Order, "status" | "statusHistory">) =>
  order.statusHistory?.[order.statusHistory.length - 1]?.message ||
  `Order is ${formatOrderStatus(order.status).toLowerCase()}`
