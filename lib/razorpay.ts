import Razorpay from "razorpay"

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error("Razorpay credentials are not configured")
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

export interface CreateOrderData {
  amount: number
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface RazorpayOrder {
  id: string
  entity: string
  amount: number
  amount_paid: number
  amount_due: number
  currency: string
  receipt: string
  offer_id: string | null
  status: string
  attempts: number
  notes: Record<string, string>
  created_at: number
}

export const createRazorpayOrder = async (data: CreateOrderData): Promise<RazorpayOrder> => {
  const options = {
    amount: data.amount * 100, // Convert to paise
    currency: data.currency || "INR",
    receipt: data.receipt || `receipt_${Date.now()}`,
    notes: data.notes || {},
  }

  const order = await razorpay.orders.create(options)
  return {
    ...order,
    amount: Number(order.amount),
    amount_paid: Number(order.amount_paid),
    amount_due: Number(order.amount_due),
  } as RazorpayOrder
}

export const verifyPaymentSignature = (orderId: string, paymentId: string, signature: string): boolean => {
  const crypto = require("crypto")
  const body = orderId + "|" + paymentId
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex")

  return expectedSignature === signature
}
