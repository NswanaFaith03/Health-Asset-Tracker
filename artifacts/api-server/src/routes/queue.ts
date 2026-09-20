import { Router } from "express";
import { db, queueTable, usersTable, consultationsTable } from "@workspace/db";
import { eq, and, count, ilike, or } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
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
  const { consultationId } = req.body;
  if (!consultationId) {
    res.status(400).json({ error: "validation", message: "consultationId is required" });
    return;
  }

  const existing = await db.select().from(queueTable)
    .where(and(eq(queueTable.studentId, req.user!.id), eq(queueTable.status, "waiting")))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "conflict", message: "Already in queue" });
    return;
  }

  const allWaiting = await db.select().from(queueTable).where(eq(queueTable.status, "waiting"));
  const maxQueue = allWaiting.length > 0 ? Math.max(...allWaiting.map((e) => e.queueNumber)) : 0;

  const [entry] = await db.insert(queueTable).values({
    consultationId,
    studentId: req.user!.id,
    queueNumber: maxQueue + 1,
    status: "waiting",
    estimatedWaitMinutes: (allWaiting.length + 1) * 15,
  }).returning();

  // Send notification to the student
  await createNotification(req.user!.id, "Queue Joined", "You have been added to the consultation queue", "queue");

  res.status(201).json(await enrichEntry(entry));
});

// New endpoint for nurses to add students to queue
router.post("/queue/add-student", requireAuth, requireRole("nurse", "admin"), async (req, res) => {
  const { consultationId, studentId } = req.body;
  if (!consultationId || !studentId) {
    res.status(400).json({ error: "validation", message: "consultationId and studentId are required" });
    return;
  }

  const existing = await db.select().from(queueTable)
    .where(and(eq(queueTable.studentId, studentId), eq(queueTable.status, "waiting")))
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "conflict", message: "Student already in queue" });
    return;
  }

  const allWaiting = await db.select().from(queueTable).where(eq(queueTable.status, "waiting"));
  const maxQueue = allWaiting.length > 0 ? Math.max(...allWaiting.map((e) => e.queueNumber)) : 0;

  const [entry] = await db.insert(queueTable).values({
    consultationId,
    studentId,
    queueNumber: maxQueue + 1,
    status: "waiting",
    estimatedWaitMinutes: (allWaiting.length + 1) * 15,
  }).returning();

  // Send notification to the student
  await createNotification(studentId, "Queue Assignment", "You have been added to the consultation queue by a nurse", "queue");

  res.status(201).json(await enrichEntry(entry));
});

router.patch("/queue/:id/complete", requireAuth, async (req, res) => {
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
  await createNotification(entry.studentId, "Queue Complete", "Your turn is complete", "queue");
  res.json(await enrichEntry(updated));
});

// Search endpoint for nurses to find students to add to queue
router.get("/queue/search-students", requireAuth, requireRole("nurse", "admin"), async (req, res) => {
  const { search, limit = 10 } = req.query as { search?: string; limit?: string };

  if (!search) {
    res.status(400).json({ error: "validation", message: "search parameter is required" });
    return;
  }

  const searchTerm = `%${search}%`;
  const limitNum = Math.min(Math.max(Number(limit) || 10, 1), 50); // Between 1 and 50

  try {
    const users = await db.select()
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, "student"),
          or(
            ilike(usersTable.name, searchTerm),
            ilike(usersTable.email, searchTerm),
            ilike(usersTable.studentNumber, searchTerm),
          )
        )
      )
      .limit(limitNum);

    // Return safe user data (excluding password hash)
    const safeUsers = users.map(({ passwordHash: _, ...safeUser }) => safeUser);
    res.json(safeUsers);
  } catch (error) {
    console.error("Error searching students:", error);
    res.status(500).json({ error: "internal_error", message: "Failed to search students" });
  }
});

export default router;
