import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const labRequestsTable = pgTable("lab_requests", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  consultationId: integer("consultation_id"),
  testType: text("test_type").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const labResultsTable = pgTable("lab_results", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull().unique(),
  results: text("results").notNull(),
  attachment: text("attachment"),
  uploadedBy: integer("uploaded_by"),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLabRequestSchema = createInsertSchema(labRequestsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLabResultSchema = createInsertSchema(labResultsTable).omit({
  id: true,
  uploadedAt: true,
});

export type InsertLabRequest = z.infer<typeof insertLabRequestSchema>;
export type LabRequest = typeof labRequestsTable.$inferSelect;
export type InsertLabResult = z.infer<typeof insertLabResultSchema>;
export type LabResult = typeof labResultsTable.$inferSelect;
