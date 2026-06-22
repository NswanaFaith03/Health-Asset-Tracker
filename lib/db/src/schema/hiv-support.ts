import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const hivSupportSessionsTable = pgTable("hiv_support_sessions", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  professionalId: integer("professional_id"),
  topic: text("topic").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("requested"),
  appointmentDate: timestamp("appointment_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const hivResourcesTable = pgTable("hiv_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdBy: integer("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertHivSupportSessionSchema = createInsertSchema(hivSupportSessionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHivResourceSchema = createInsertSchema(hivResourcesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertHivSupportSession = z.infer<typeof insertHivSupportSessionSchema>;
export type HivSupportSession = typeof hivSupportSessionsTable.$inferSelect;
export type InsertHivResource = z.infer<typeof insertHivResourceSchema>;
export type HivResource = typeof hivResourcesTable.$inferSelect;
