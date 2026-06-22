import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const prescriptionsTable = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  consultationId: integer("consultation_id"),
  medication: text("medication").notNull(),
  dosage: text("dosage").notNull(),
  instructions: text("instructions").notNull(),
  duration: text("duration"),
  status: text("status").notNull().default("pending"),
  dispensedAt: timestamp("dispensed_at", { withTimezone: true }),
  dispensedBy: integer("dispensed_by"),
  dispensingNotes: text("dispensing_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptionsTable.$inferSelect;
