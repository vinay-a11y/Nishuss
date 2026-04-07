import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { orderService } from "@/lib/firebase-services"
import { adminAuth } from "@/lib/firebaseAdmin"

// 🔐 Razorpay signature verification
function verifyPaymentSignature(orderId: string, paymentId: string, signature: string) {
  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
    .update(body.toString())
    .digest("hex")

  return expectedSignature === signature
}

export async function POST(req: NextRequest) {
  try {
    const { orderId, paymentId, signature, orderData, idToken } = await req.json()

    console.log("🔍 Incoming verify payload:", { orderId, paymentId, signature })

    if (!orderId || !paymentId || !signature) {
      console.error("❌ Missing required fields:", { orderId, paymentId, signature })
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    let userId: string
    if (idToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(idToken)
        userId = decodedToken.uid
      } catch (error) {
        console.error("❌ Invalid authentication token:", error)
        return NextResponse.json({ success: false, message: "Invalid authentication token" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Verify Razorpay payment signature
    const isValid = verifyPaymentSignature(orderId, paymentId, signature)
    console.log("🔑 Signature valid:", isValid)

    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid payment signature" }, { status: 400 })
    }

    try {
      if (!orderData || !orderData.items || !orderData.address) {
        throw new Error("Missing order data")
      }

      const firebaseOrderId = await orderService.createOrder({
        userId,
        items: orderData.items,
        totalAmount: orderData.itemsTotal,
        deliveryFee: orderData.deliveryFee,
        finalAmount: orderData.totalAmount,
        status: "CONFIRMED",
        deliveryAddress: orderData.address,
        paymentId,
        paymentStatus: "COMPLETED",
        estimatedDeliveryTime: 30,
        razorpayOrderId: orderId, // Store Razorpay order ID for reference
      })

      console.log("✅ Firebase order created successfully:", firebaseOrderId)

      return NextResponse.json(
        {
          success: true,
          message: "Payment verified and order created successfully",
          orderId: firebaseOrderId,
        },
        { status: 200 },
      )
    } catch (dbError) {
      console.error("❌ Failed to create order:", dbError)
      throw dbError
    }
  } catch (error: any) {
    console.error("❌ Payment verification error:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Payment verification failed" },
      { status: 500 },
    )
  }
}
