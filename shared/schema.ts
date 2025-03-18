import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  walletAddress: text("wallet_address").notNull().unique(),
  points: integer("points").notNull().default(0),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  change24h: text("change_24h").notNull(),
  marketCap: text("market_cap").notNull(),
  volume24h: text("volume_24h").notNull(),
});

export const analysis = pgTable("analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tokenId: integer("token_id").notNull(),
  points: integer("points").notNull(),
  type: text("type").notNull(), // basic, advanced, premium
  data: jsonb("data").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  walletAddress: true,
});

export const insertTokenSchema = createInsertSchema(tokens);

export const insertAnalysisSchema = createInsertSchema(analysis);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Token = typeof tokens.$inferSelect;
export type Analysis = typeof analysis.$inferSelect;
