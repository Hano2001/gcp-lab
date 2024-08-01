import { decimal, pgTable, serial, uuid } from "drizzle-orm/pg-core";

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().notNull().primaryKey(),
  carId: uuid("car_id").notNull(),
  amount: decimal("amount").notNull(),
});

export const paymentsOutbox = pgTable("payments_outbox", {
  id: serial("id").notNull().primaryKey(),
  carId: uuid("car_id").notNull(),
});
