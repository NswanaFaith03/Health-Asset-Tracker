import { Router } from "express";
import { db, consultationsTable, usersTable, queueTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { createNotification } from "../lib/notify";

const router = Router();

async function getNextQueueNumber() {
  const allWaiting = await db.select().from(queueTable).where(eq(queueTable.status, "waiting"));
  return allWaiting.length > 0 ? Math.max(...allWaiting.map((entry) => entry.queueNumber)) + 1 : 1;
}

async function enrichConsultation(c: typeof consultationsTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, c.studentId)).limit(1);
  let doctor = null;
  if (c.doctorId) {
    const [d] = await db.select().from(usersTable).where(eq(usersTable.id, c.doctorId)).limit(1);
    if (d) {
      const { passwordHash: _, ...safe } = d;
      doctor = safe;
    }
  }
  const { passwordHash: _, ...safeStudent } = student ?? { passwordHash: "", id: c.studentId, name: "Unknown", email: "", role: "student", status: "active", createdAt: new Date(), updatedAt: new Date(), studentNumber: null, phone: null };
  return { ...c, student: safeStudent, doctor };
}

router.get("/consultations", requireAuth, async (req, res) => {
  const { status, studentId, doctorId } = req.query;
  const user = req.user!;

  let rows: typeof consultationsTable.$inferSelect[];

  if (user.role === "student") {
    const conditions = [eq(consultationsTable.studentId, user.id)];
    if (status) conditions.push(eq(consultationsTable.status, String(status)));
    rows = await db.select().from(consultationsTable).where(and(...conditions)).orderBy(consultationsTable.createdAt);
  } else if (user.role === "doctor") {
    const conditions = doctorId
      ? [eq(consultationsTable.doctorId, Number(doctorId))]
      : [eq(consultationsTable.doctorId, user.id)];
    if (status) conditions.push(eq(consultationsTable.status, String(status)));
    const allSubmitted = await db.select().from(consultationsTable).where(eq(consultationsTable.status, "submitted")).orderBy(consultationsTable.createdAt);
    const myConsultations = await db.select().from(consultationsTable).where(and(...conditions)).orderBy(consultationsTable.createdAt);
    const ids = new Set(myConsultations.map((c) => c.id));
    rows = [...myConsultations, ...allSubmitted.filter((c) => !ids.has(c.id))];
  } else {
    let conditions: ReturnType<typeof eq>[] = [];
    if (status) conditions.push(eq(consultationsTable.status, String(status)));
    if (studentId) conditions.push(eq(consultationsTable.studentId, Number(studentId)));
    rows = conditions.length > 0
      ? await db.select().from(consultationsTable).where(and(...conditions)).orderBy(consultationsTable.createdAt)
      : await db.select().from(consultationsTable).orderBy(consultationsTable.createdAt);
  }

  const enriched = await Promise.all(rows.map(enrichConsultation));
  res.json(enriched);
});

router.post("/consultations", requireAuth, async (req, res) => {
  const { symptoms, severity, attachments } = req.body;
  if (!symptoms || !severity) {
    res.status(400).json({ error: "validation", message: "symptoms and severity are required" });
    return;
  }
  const [row] = await db.insert(consultationsTable).values({
    studentId: req.user!.id,
    symptoms,
    severity,
    attachments: attachments ?? [],
    status: "submitted",
  }).returning();

  const existingQueueEntry = await db.select().from(queueTable)
    .where(and(eq(queueTable.consultationId, row.id), eq(queueTable.status, "waiting")))
    .limit(1);

  if (existingQueueEntry.length === 0) {
    const queueNumber = await getNextQueueNumber();
    await db.insert(queueTable).values({
      consultationId: row.id,
      studentId: req.user!.id,
      queueNumber,
      status: "waiting",
      estimatedWaitMinutes: queueNumber * 15,
    });
  }

  await logAudit(req, "create_consultation", "consultation", row.id);
  res.status(201).json(await enrichConsultation(row));
});

router.get("/consultations/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(await enrichConsultation(row));
});

router.put("/consultations/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const {
    diagnosis,
    notes,
    status,
    temperature,
    bloodPressure,
    heartRate,
    respiratoryRate,
    oxygenSaturation,
    weight,
  } = req.body;

  const [existing] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const vitalsProvided = [temperature, bloodPressure, heartRate, respiratoryRate, oxygenSaturation, weight].some((value) => value !== undefined);
  if (vitalsProvided && !["nurse", "admin"].includes(req.user!.role)) {
    res.status(403).json({ error: "forbidden", message: "Only nurses or admins can record vitals" });
    return;
  }

  const updateData: Partial<typeof consultationsTable.$inferSelect> = {};
  if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) updateData.status = status;
  if (temperature !== undefined) updateData.temperature = temperature;
  if (bloodPressure !== undefined) updateData.bloodPressure = bloodPressure;
  if (heartRate !== undefined) updateData.heartRate = heartRate;
  if (respiratoryRate !== undefined) updateData.respiratoryRate = respiratoryRate;
  if (oxygenSaturation !== undefined) updateData.oxygenSaturation = oxygenSaturation;
  if (weight !== undefined) updateData.weight = weight;

  const [updated] = await db.update(consultationsTable)
    .set({ ...updateData, status: status ?? existing.status })
    .where(eq(consultationsTable.id, id))
    .returning();
  await logAudit(req, "update_consultation", "consultation", id);
  if (status === "responded" && existing.studentId) {
    await createNotification(existing.studentId, "Consultation Responded", "Your consultation has been responded to by the doctor", "consultation");
  }
  res.json(await enrichConsultation(updated));
});

router.patch("/consultations/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status, doctorId } = req.body;
  const [existing] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const updateData: Partial<typeof consultationsTable.$inferSelect> = { status };
  if (doctorId) updateData.doctorId = doctorId;
  const [updated] = await db.update(consultationsTable)
    .set(updateData)
    .where(eq(consultationsTable.id, id))
    .returning();
  await logAudit(req, "update_consultation_status", "consultation", id, `status=${status}`);
  if (existing.studentId) {
    await createNotification(existing.studentId, "Consultation Updated", `Your consultation status is now: ${status}`, "consultation");
  }
  res.json(await enrichConsultation(updated));
});

export default router;
