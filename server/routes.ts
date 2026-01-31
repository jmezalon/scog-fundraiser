import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { checkoutSchema, cartItemSchema, HOODIE_PRICE, type InsertOrder } from "@shared/schema";
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

const confirmPaymentSchema = z.object({
  paymentIntentId: z.string().min(1, "Payment intent ID is required"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Create a payment intent
  app.post("/api/create-payment-intent", async (req, res) => {
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
  });

  // Confirm payment and create order
  app.post("/api/confirm-payment", async (req, res) => {
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
  });

  // Create a new order (legacy - without payment)
  app.post("/api/orders", async (req, res) => {
    try {
      // Validate checkout data (customer info + items array)
      const checkoutData = checkoutSchema.parse(req.body);

      // Server-side price validation for security
      const calculatedTotal = checkoutData.items.reduce(
        (sum, item) => sum + (item.quantity * HOODIE_PRICE),
        0
      );

      if (calculatedTotal !== checkoutData.totalPrice) {
        res.status(400).json({
          message: "Price mismatch. Please refresh and try again."
        });
        return;
      }

      // Convert items array to JSON string for storage
      const orderData: InsertOrder = {
        firstName: checkoutData.firstName,
        lastName: checkoutData.lastName,
        email: checkoutData.email,
        phone: checkoutData.phone,
        items: JSON.stringify(checkoutData.items),
        totalPrice: calculatedTotal,
      };

      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors
        });
      } else {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Get all orders (for admin purposes)
  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get a specific order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
