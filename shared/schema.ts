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

// Hoodie order schema
export const orders = pgTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  color: text("color").notNull(),
  size: text("size").notNull(),
  quantity: integer("quantity").notNull().default(1),
  totalPrice: integer("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

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
