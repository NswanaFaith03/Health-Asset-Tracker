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
  const rows = await db.select().from(queueTable)
    .where(eq(queueTable.status, "waiting"))
    .orderBy(queueTable.queueNumber);
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

  const [ahead] = await db.select({ count: count() }).from(queueTable)
    .where(and(eq(queueTable.status, "waiting")));

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

router.post("/queue/join", requireAuth, async (req, res) => {
  const { consultationId, studentId } = req.body;
  const user = req.user!;

  // Only nurses and admins can add students to queue on behalf
  const targetStudentId = studentId && ["nurse", "admin"].includes(user.role) ? studentId : user.id;

  if (!consultationId) {
    res.status(400).json({ error: "validation", message: "consultationId is required" });
    return;
  }

  const existing = await db.select().from(queueTable)
    .where(and(eq(queueTable.studentId, targetStudentId), eq(queueTable.status, "waiting")))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "conflict", message: "Already in queue" });
    return;
  }

  const allWaiting = await db.select().from(queueTable).where(eq(queueTable.status, "waiting"));
  const maxQueue = allWaiting.length > 0 ? Math.max(...allWaiting.map((e) => e.queueNumber)) : 0;

  const [entry] = await db.insert(queueTable).values({
    consultationId,
    studentId: targetStudentId,
    queueNumber: maxQueue + 1,
    status: "waiting",
    estimatedWaitMinutes: (allWaiting.length + 1) * 15,
  }).returning();

  res.status(201).json(await enrichEntry(entry));
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
