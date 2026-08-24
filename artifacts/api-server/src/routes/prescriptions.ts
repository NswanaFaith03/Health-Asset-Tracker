/**
 * @module Prescription Routes
 * @file prescriptions.ts
 * @developer Khadijah
 * @role Senior Diagnostics & Pharmacy Integration Specialist
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, prescriptionsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { createNotification } from "../lib/notify";

const router = Router();

async function enrichPrescription(p: typeof prescriptionsTable.$inferSelect) {
  const [patient] = await db.select().from(usersTable).where(eq(usersTable.id, p.patientId)).limit(1);
  const [doctor] = await db.select().from(usersTable).where(eq(usersTable.id, p.doctorId)).limit(1);
  const safeUser = (u: typeof usersTable.$inferSelect | undefined) => {
    if (!u) return null;
    const { passwordHash: _, ...safe } = u;
    return safe;
  };
  return { ...p, patient: safeUser(patient), doctor: safeUser(doctor) };
}

router.get("/prescriptions", requireAuth, async (req, res) => {
  const { status, patientId } = req.query;
  const user = req.user!;

  let rows: typeof prescriptionsTable.$inferSelect[];
  if (user.role === "student") {
    const conditions = [eq(prescriptionsTable.patientId, user.id)];
    if (status) conditions.push(eq(prescriptionsTable.status, String(status)));
    rows = await db.select().from(prescriptionsTable).where(and(...conditions)).orderBy(prescriptionsTable.createdAt);
  } else {
    const conditions: ReturnType<typeof eq>[] = [];
    if (status) conditions.push(eq(prescriptionsTable.status, String(status)));
    if (patientId) conditions.push(eq(prescriptionsTable.patientId, Number(patientId)));
    rows = conditions.length > 0
      ? await db.select().from(prescriptionsTable).where(and(...conditions)).orderBy(prescriptionsTable.createdAt)
      : await db.select().from(prescriptionsTable).orderBy(prescriptionsTable.createdAt);
  }

  const enriched = await Promise.all(rows.map(enrichPrescription));
  res.json(enriched);
});

router.post("/prescriptions", requireAuth, async (req, res) => {
  const { patientId, consultationId, medication, dosage, instructions, duration } = req.body;
  if (!patientId || !medication || !dosage || !instructions) {
    res.status(400).json({ error: "validation", message: "patientId, medication, dosage, and instructions are required" });
    return;
  }
  const [row] = await db.insert(prescriptionsTable).values({
    patientId,
    doctorId: req.user!.id,
    consultationId: consultationId ?? null,
    medication,
    dosage,
    instructions,
    duration: duration ?? null,
    status: "pending",
  }).returning();
  await logAudit(req, "create_prescription", "prescription", row.id);
  await createNotification(patientId, "New Prescription", `Dr. has issued you a prescription for ${medication}`, "prescription");
  res.status(201).json(await enrichPrescription(row));
});

router.get("/prescriptions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.id, id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(await enrichPrescription(row));
});

router.patch("/prescriptions/:id/dispense", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { dispensedBy, notes } = req.body;
  const [existing] = await db.select().from(prescriptionsTable).where(eq(prescriptionsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const [updated] = await db.update(prescriptionsTable)
    .set({ status: "dispensed", dispensedAt: new Date(), dispensedBy, dispensingNotes: notes ?? null })
    .where(eq(prescriptionsTable.id, id))
    .returning();
  await logAudit(req, "dispense_prescription", "prescription", id);
  await createNotification(existing.patientId, "Prescription Ready", "Your prescription has been dispensed. Please collect from pharmacy.", "prescription");
  res.json(await enrichPrescription(updated));
});

export default router;
