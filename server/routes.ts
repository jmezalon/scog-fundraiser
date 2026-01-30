import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkoutSchema, HOODIE_PRICE, type InsertOrder } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Create a new order
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
