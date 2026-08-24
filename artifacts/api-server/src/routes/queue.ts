/**
 * @module Queue Routes
 * @file queue.ts
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, queueTable, usersTable, consultationsTable } from "@workspace/db";
import { eq, and, count } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { createNotification } from "../lib/notify";

const router = Router();

async function enrichEntry(entry: typeof queueTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, entry.studentId)).limit(1);
  const [consultation] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, entry.consultationId)).limit(1);
  const { passwordHash: _, ...safeStudent } = student ?? { passwordHash: "", id: entry.studentId, name: "Unknown", email: "", role: "student", status: "active", createdAt: new Date(), updatedAt: new Date(), studentNumber: null, phone: null };
  return { ...entry, student: safeStudent, consultation: consultation ?? null };
}

router.get("/queue", requireAuth, async (req, res) => {
  const requestedStatus = String(req.query.status ?? "waiting").toLowerCase();
  const validStatuses = new Set(["waiting", "completed", "all"]);
  const statusFilter = validStatuses.has(requestedStatus) ? requestedStatus : "waiting";

  let rows = await db.select().from(queueTable).orderBy(queueTable.queueNumber);
  if (statusFilter !== "all") {
    rows = await db.select().from(queueTable)
      .where(eq(queueTable.status, statusFilter))
      .orderBy(queueTable.queueNumber);
  }

  const enriched = await Promise.all(rows.map(enrichEntry));
  res.json(enriched);
});

router.get("/queue/my-position", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const [myEntry] = await db.select().from(queueTable)
    .where(and(eq(queueTable.studentId, userId), eq(queueTable.status, "waiting")))
    .limit(1);

  if (!myEntry) {
    const [total] = await db.select({ count: count() }).from(queueTable).where(eq(queueTable.status, "waiting"));
    res.json({ position: 0, status: "not_in_queue", totalInQueue: Number(total?.count ?? 0) });
    return;
  }

  const allWaiting = await db.select().from(queueTable)
    .where(eq(queueTable.status, "waiting"))
    .orderBy(queueTable.queueNumber);

  const position = allWaiting.findIndex((e) => e.studentId === userId) + 1;
  const totalInQueue = allWaiting.length;

  res.json({
    position,
    queueNumber: myEntry.queueNumber,
    estimatedWaitMinutes: position * 15,
    status: myEntry.status,
    totalInQueue,
  });
});

router.post("/queue/clear-completed", requireAuth, async (req, res) => {
  const user = req.user!;
  if (!["doctor", "nurse", "admin"].includes(user.role)) {
    return res.status(403).json({ error: "forbidden", message: "Only clinical staff can clear completed queue entries" });
  }

  const completedEntries = await db.select().from(queueTable).where(eq(queueTable.status, "completed"));
  if (completedEntries.length === 0) {
    return res.json({ cleared: 0, message: "No completed queue entries to clear" });
  }

  const ids = completedEntries.map((entry) => entry.id);
  await db.delete(queueTable).where(eq(queueTable.status, "completed"));

  for (const entry of completedEntries) {
    if (entry.consultationId) {
      await db.update(consultationsTable)
        .set({ status: "closed" })
        .where(eq(consultationsTable.id, entry.consultationId));
    }
  }

  return res.json({ cleared: ids.length, message: `Cleared ${ids.length} completed queue entries` });
});

router.post("/queue/join", requireAuth, async (req, res) => {
  const { consultationId, studentId } = req.body;
  const user = req.user!;

  let targetStudentId = user.id;

  if (["nurse", "admin"].includes(user.role)) {
    if (!studentId) {
      res.status(400).json({ error: "validation", message: "studentId is required for staff members adding to queue" });
      return;
    }

    const lookupId = Number(studentId);
    let student = null;

    if (!isNaN(lookupId)) {
      [student] = await db.select().from(usersTable)
        .where(and(eq(usersTable.id, lookupId), eq(usersTable.role, "student")))
        .limit(1);
    }

    if (!student) {
      [student] = await db.select().from(usersTable)
        .where(and(eq(usersTable.studentNumber, String(studentId).trim()), eq(usersTable.role, "student")))
        .limit(1);
    }

    if (!student) {
      res.status(404).json({ error: "validation", message: "No valid student found with the provided Student ID or Student Number" });
      return;
    }

    targetStudentId = student.id;
  }

  if (!consultationId) {
    res.status(400).json({ error: "validation", message: "consultationId is required" });
    return;
  }

  const [consultation] = await db.select().from(consultationsTable)
    .where(eq(consultationsTable.id, Number(consultationId)))
    .limit(1);

  if (!consultation) {
    res.status(404).json({ error: "validation", message: "Consultation not found" });
    return;
  }

  if (consultation.studentId !== targetStudentId) {
    res.status(400).json({ error: "validation", message: "This consultation does not belong to the selected student" });
    return;
  }

  const existing = await db.select().from(queueTable)
    .where(and(eq(queueTable.studentId, targetStudentId), eq(queueTable.status, "waiting")))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "conflict", message: "Student is already in the queue" });
    return;
  }

  const allWaiting = await db.select().from(queueTable).where(eq(queueTable.status, "waiting"));
  const maxQueue = allWaiting.length > 0 ? Math.max(...allWaiting.map((e) => e.queueNumber)) : 0;

  const [entry] = await db.insert(queueTable).values({
    consultationId: Number(consultationId),
    studentId: targetStudentId,
    queueNumber: maxQueue + 1,
    status: "waiting",
    estimatedWaitMinutes: (allWaiting.length + 1) * 15,
  }).returning();

  res.status(201).json(await enrichEntry(entry));
});

router.patch("/queue/:id/status", requireAuth, async (req, res) => {
  const user = req.user!;
  if (!["doctor", "nurse", "admin"].includes(user.role)) {
    return res.status(403).json({ error: "forbidden", message: "Only clinical staff can update queue status" });
  }

  const id = Number(req.params.id);
  const { status } = req.body;
  if (!status || !["waiting", "completed"].includes(status)) {
    return res.status(400).json({ error: "validation", message: "status must be waiting or completed" });
  }

  const [entry] = await db.select().from(queueTable).where(eq(queueTable.id, id)).limit(1);
  if (!entry) {
    return res.status(404).json({ error: "not_found" });
  }

  const [updated] = await db.update(queueTable)
    .set({ status })
    .where(eq(queueTable.id, id))
    .returning();

  await db.update(consultationsTable)
    .set({
      status: status === "completed" ? "closed" : "submitted",
      doctorId: user.role === "doctor" ? user.id : undefined,
    })
    .where(eq(consultationsTable.id, entry.consultationId));

  if (status === "completed") {
    await createNotification(entry.studentId, "Queue Complete", "Your consultation has been closed by the doctor", "queue");
  }

  return res.json(await enrichEntry(updated));
});

router.patch("/queue/:id/complete", requireAuth, async (req, res) => {
  const user = req.user!;
  if (!["doctor", "admin"].includes(user.role)) {
    res.status(403).json({ error: "forbidden", message: "Only doctors or admins can complete queue entries" });
    return;
  }

  const id = Number(req.params.id);
  const [entry] = await db.select().from(queueTable).where(eq(queueTable.id, id)).limit(1);
  if (!entry) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const [updated] = await db.update(queueTable)
    .set({ status: "completed" })
    .where(eq(queueTable.id, id))
    .returning();

  const updateData: Partial<typeof consultationsTable.$inferSelect> = { status: "closed" };
  if (user.role === "doctor") {
    updateData.doctorId = user.id;
  }
  await db.update(consultationsTable)
    .set(updateData)
    .where(eq(consultationsTable.id, entry.consultationId));

  await createNotification(entry.studentId, "Queue Complete", "Your consultation has been closed by the doctor", "queue");
  res.json(await enrichEntry(updated));
});

export default router;
