import Stripe from "stripe";
import { storage } from "../../server/storage";
import { HOODIE_PRICE, type InsertOrder } from "../../shared/schema";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const data = confirmPaymentSchema.parse(req.body);

    // Retrieve and verify the payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(data.paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      res.status(400).json({
        message: "Payment has not been completed",
        status: paymentIntent.status,
      });
      return;
    }

    // Extract order data from payment intent metadata
    const metadata = paymentIntent.metadata;
    const items = JSON.parse(metadata.items || "[]");

    // Recalculate total from items for security
    const calculatedTotal = items.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity * HOODIE_PRICE,
      0
    );

    // Verify amount matches
    if (paymentIntent.amount !== calculatedTotal * 100) {
      res.status(400).json({
        message: "Payment amount mismatch",
      });
      return;
    }

    // Create the order
    const orderData: InsertOrder = {
      firstName: metadata.firstName,
      lastName: metadata.lastName,
      email: metadata.email,
      phone: metadata.phone,
      items: metadata.items,
      totalPrice: calculatedTotal,
      paymentIntentId: paymentIntent.id,
      paymentStatus: "paid",
    };

    const order = await storage.createOrder(orderData);

    res.status(201).json({
      order,
      message: "Order created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    } else if (error instanceof Stripe.errors.StripeError) {
      console.error("Stripe error:", error);
      res.status(400).json({ message: error.message });
    } else {
      console.error("Error confirming payment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
