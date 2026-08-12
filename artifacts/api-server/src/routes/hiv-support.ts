import { Router } from "express";
import { db, hivSupportSessionsTable, hivResourcesTable, usersTable, messagesTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { createNotification } from "../lib/notify";

const router = Router();

async function enrichSession(s: typeof hivSupportSessionsTable.$inferSelect) {
  const safeUser = (u: typeof usersTable.$inferSelect | undefined) => {
    if (!u) return null;
    const { passwordHash: _, ...safe } = u;
    return safe;
  };
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, s.studentId)).limit(1);
  let professional = null;
  if (s.professionalId) {
    const [p] = await db.select().from(usersTable).where(eq(usersTable.id, s.professionalId)).limit(1);
    professional = safeUser(p);
  }
  return { ...s, student: safeUser(student), professional };
}

router.get("/hiv-support/sessions", requireAuth, async (req, res) => {
  const user = req.user!;
  let rows: typeof hivSupportSessionsTable.$inferSelect[];

  if (user.role === "student") {
    rows = await db.select().from(hivSupportSessionsTable)
      .where(eq(hivSupportSessionsTable.studentId, user.id))
      .orderBy(hivSupportSessionsTable.createdAt);
  } else if (user.role === "hiv_professional") {
    rows = await db.select().from(hivSupportSessionsTable)
      .where(or(
        eq(hivSupportSessionsTable.professionalId, user.id),
        eq(hivSupportSessionsTable.status, "requested"),
      ))
      .orderBy(hivSupportSessionsTable.createdAt);
  } else {
    rows = await db.select().from(hivSupportSessionsTable).orderBy(hivSupportSessionsTable.createdAt);
  }

  res.json(await Promise.all(rows.map(enrichSession)));
});

router.post("/hiv-support/sessions", requireAuth, async (req, res) => {
  const { topic, appointmentDate, notes } = req.body;
  if (!topic) {
    res.status(400).json({ error: "validation", message: "topic is required" });
    return;
  }
  const [session] = await db.insert(hivSupportSessionsTable).values({
    studentId: req.user!.id,
    topic,
    notes: notes ?? null,
    status: "requested",
    appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
  }).returning();
  await logAudit(req, "create_hiv_session", "hiv_support_session", session.id);
  res.status(201).json(await enrichSession(session));
});

router.put("/hiv-support/sessions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { notes, status, appointmentDate } = req.body;
  const [existing] = await db.select().from(hivSupportSessionsTable).where(eq(hivSupportSessionsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const updateData: Partial<typeof hivSupportSessionsTable.$inferSelect> = {};
  if (notes != null) updateData.notes = notes;
  if (status) {
    updateData.status = status;
    if (status === "active" && !existing.professionalId) {
      updateData.professionalId = req.user!.id;
    }
  }
  if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);

  const [updated] = await db.update(hivSupportSessionsTable)
    .set(updateData)
    .where(eq(hivSupportSessionsTable.id, id))
    .returning();
  await logAudit(req, "update_hiv_session", "hiv_support_session", id);
  if (status === "active" && existing.studentId) {
    await createNotification(existing.studentId, "HIV Support Session Accepted", "Your session request has been accepted", "counseling");
  }
  if (status === "completed" && existing.studentId) {
    await createNotification(existing.studentId, "Session Completed", "Your HIV support session has been completed.", "counseling");
  }
  res.json(await enrichSession(updated));
});

// Messages for HIV support sessions (reuses messagesTable with sessionId)
router.get("/hiv-support/sessions/:id/messages", requireAuth, async (req, res) => {
  const sessionId = Number(req.params.id);
  const rows = await db.select().from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(messagesTable.createdAt);

  const fallback = (id: number) => ({ passwordHash: "", id, name: "Unknown", email: "", role: "student", status: "active", createdAt: new Date(), updatedAt: new Date(), studentNumber: null, phone: null, avatarUrl: null, requiresPasswordReset: false });
  const enriched = await Promise.all(rows.map(async (m) => {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, m.senderId)).limit(1);
    const { passwordHash: _, ...safeSender } = sender ?? fallback(m.senderId);
    return { ...m, sender: safeSender };
  }));

  res.json(enriched);
});

router.post("/hiv-support/sessions/:id/messages", requireAuth, async (req, res) => {
  const sessionId = Number(req.params.id);
  const { content } = req.body;
  if (!content) {
    res.status(400).json({ error: "validation", message: "content is required" });
    return;
  }
  const [msg] = await db.insert(messagesTable).values({
    sessionId,
    senderId: req.user!.id,
    content,
  }).returning();

  // Notify the other party
  const [session] = await db.select().from(hivSupportSessionsTable).where(eq(hivSupportSessionsTable.id, sessionId)).limit(1);
  if (session) {
    const targetId = req.user!.id === session.studentId ? session.professionalId : session.studentId;
    if (targetId) {
      await createNotification(targetId, "New Message", "You have a new message in your HIV support session", "counseling");
    }
  }

  const fallback = (id: number) => ({ passwordHash: "", id, name: "Unknown", email: "", role: "student", status: "active", createdAt: new Date(), updatedAt: new Date(), studentNumber: null, phone: null, avatarUrl: null, requiresPasswordReset: false });
  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, msg.senderId)).limit(1);
  const { passwordHash: _, ...safeSender } = sender ?? fallback(msg.senderId);
  res.status(201).json({ ...msg, sender: safeSender });
});

router.get("/hiv-support/resources", requireAuth, async (req, res) => {
  const rows = await db.select().from(hivResourcesTable).orderBy(hivResourcesTable.createdAt);
  res.json(rows);
});

router.post("/hiv-support/resources", requireAuth, async (req, res) => {
  const { title, content, category } = req.body;
  if (!title || !content || !category) {
    res.status(400).json({ error: "validation", message: "title, content, and category are required" });
    return;
  }
  const [resource] = await db.insert(hivResourcesTable).values({
    title,
    content,
    category,
    createdBy: req.user!.id,
  }).returning();
  await logAudit(req, "create_hiv_resource", "hiv_resource", resource.id);
  res.status(201).json(resource);
});

export default router;
