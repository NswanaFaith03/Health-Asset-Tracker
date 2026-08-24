import { integer, pgTable, serial, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const consultationsTable = pgTable("consultations", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  doctorId: integer("doctor_id"),
  symptoms: text("symptoms").notNull(),
  severity: text("severity").notNull().default("low"),
  attachments: text("attachments").array().default([]),
  temperature: text("temperature"),
  bloodPressure: text("blood_pressure"),
  heartRate: text("heart_rate"),
  respiratoryRate: text("respiratory_rate"),
  oxygenSaturation: text("oxygen_saturation"),
  weight: text("weight"),
  status: text("status").notNull().default("submitted"),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  dismissalReason: text("dismissal_reason"),
  resolutionReason: text("resolution_reason"),
  informationRequests: jsonb("information_requests").default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertConsultationSchema = createInsertSchema(consultationsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Consultation = typeof consultationsTable.$inferSelect;
