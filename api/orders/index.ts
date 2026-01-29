import { insertOrderSchema } from "../../shared/schema";
import { storage } from "../../server/storage";
import { z } from "zod";

export default async function handler(req: any, res: any) {
  if (req.method === "POST") {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
      } else {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
    return;
  }

  if (req.method === "GET") {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
    return;
  }

  res.setHeader("Allow", "GET, POST");
  res.status(405).json({ message: "Method Not Allowed" });
}
