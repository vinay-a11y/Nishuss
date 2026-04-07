import { type NextRequest, NextResponse } from "next/server";
import { createRazorpayOrder } from "@/lib/razorpay";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, receipt, notes, idToken } = await request.json();

    // === AUTHENTICATION (optional) ===
    if (idToken) {
      try {
        await adminAuth.verifyIdToken(idToken);
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid authentication token" },
          { status: 401 }
        );
      }
    }
    // If idToken is missing, you can still proceed (for testing)
    // Remove the above if you want to force authentication

    // === VALIDATE AMOUNT ===
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // === CREATE RAZORPAY ORDER ===
    const order = await createRazorpayOrder({
      amount,
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`,
      notes: notes || {},
    });

    // === RETURN ORDER DETAILS TO CLIENT ===
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { error: "Failed to create payment order", details: error.message },
      { status: 500 }
    );
  }
}
