import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const queueTable = pgTable("queue", {
  id: serial("id").primaryKey(),
  consultationId: integer("consultation_id").notNull(),
  studentId: integer("student_id").notNull(),
  queueNumber: integer("queue_number").notNull(),
  status: text("status").notNull().default("waiting"),
  estimatedWaitMinutes: integer("estimated_wait_minutes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertQueueSchema = createInsertSchema(queueTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type QueueEntry = typeof queueTable.$inferSelect;
