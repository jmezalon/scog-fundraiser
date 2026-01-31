import Stripe from "stripe";
import { cartItemSchema, HOODIE_PRICE } from "../../shared/schema";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2026-01-28.clover",
});

const createPaymentIntentSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  customerInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
  }),
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ message: "Method Not Allowed" });
    return;
  }

  try {
    const data = createPaymentIntentSchema.parse(req.body);

    // Server-side price calculation for security
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.quantity * HOODIE_PRICE,
      0
    );

    // Create PaymentIntent with enabled payment methods
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount * 100, // Stripe expects cents
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        firstName: data.customerInfo.firstName,
        lastName: data.customerInfo.lastName,
        email: data.customerInfo.email,
        phone: data.customerInfo.phone,
        items: JSON.stringify(data.items),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: totalAmount,
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
      console.error("Error creating payment intent:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
