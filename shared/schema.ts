import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Cart item schema
export const cartItemSchema = z.object({
  color: z.string(),
  size: z.string(),
  quantity: z.number().min(1).max(10),
  pricePerUnit: z.number(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

// Hoodie order schema
export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  items: text("items").notNull(), // JSON stringified array of CartItem[]
  totalPrice: integer("total_price").notNull(),
  paymentIntentId: text("payment_intent_id"),
  paymentStatus: text("payment_status").default("pending"), // pending, paid, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Checkout schema for order submission
export const checkoutSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  items: z.array(cartItemSchema).min(1, "Cart cannot be empty"),
  totalPrice: z.number().min(1),
});

export type CheckoutData = z.infer<typeof checkoutSchema>;

// Available hoodie options
export const HOODIE_COLORS = [
  { name: "Black", value: "black", hex: "#1a1a1a" },
  { name: "Red", value: "red", hex: "#c41e3a" },
  { name: "Navy Blue", value: "navy-blue", hex: "#1e3a5f" },
  { name: "Dark Grey", value: "dark-grey", hex: "#404040" },
  { name: "Sapphire Blue", value: "sapphire-blue", hex: "#0f52ba" },
  { name: "Purple", value: "purple", hex: "#5d3a6a" },
] as const;

export const HOODIE_SIZES = [
  { name: "Youth Medium", value: "youth-medium" },
  { name: "Youth Large", value: "youth-large" },
  { name: "Medium", value: "medium" },
  { name: "Large", value: "large" },
  { name: "XL", value: "xl" },
  { name: "XXL", value: "xxl" },
  { name: "XXXL", value: "xxxl" },
] as const;

export const HOODIE_PRICE = 65;
