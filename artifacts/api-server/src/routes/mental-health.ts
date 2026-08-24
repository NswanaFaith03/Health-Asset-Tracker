/**
 * @module Mental Health Routes
 * @file mental-health.ts
 * @developer moses
 * @role Senior Mental Health & Support Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, mentalHealthSessionsTable, messagesTable, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { createNotification } from "../lib/notify";

const router = Router();

async function enrichSession(s: typeof mentalHealthSessionsTable.$inferSelect) {
  const safeUser = (u: typeof usersTable.$inferSelect | undefined) => {
    if (!u) return null;
    const { passwordHash: _, ...safe } = u;
    return safe;
  };

  let student = null;
  if (!s.isAnonymous) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, s.studentId)).limit(1);
    student = safeUser(u);
  }

  let counselor = null;
  if (s.counselorId) {
    const [u] = await db.select().from(usersTable).where(eq(usersTable.id, s.counselorId)).limit(1);
    counselor = safeUser(u);
  }

  return { ...s, student, counselor };
}

router.get("/mental-health/sessions", requireAuth, async (req, res) => {
  const user = req.user!;
  let rows: typeof mentalHealthSessionsTable.$inferSelect[];

  if (user.role === "student") {
    rows = await db.select().from(mentalHealthSessionsTable)
      .where(eq(mentalHealthSessionsTable.studentId, user.id))
      .orderBy(mentalHealthSessionsTable.createdAt);
  } else if (user.role === "mental_health_counselor") {
    rows = await db.select().from(mentalHealthSessionsTable)
      .where(or(
        eq(mentalHealthSessionsTable.counselorId, user.id),
        eq(mentalHealthSessionsTable.status, "requested"),
      ))
      .orderBy(mentalHealthSessionsTable.createdAt);
  } else {
    rows = await db.select().from(mentalHealthSessionsTable)
      .orderBy(mentalHealthSessionsTable.createdAt);
  }

  const enriched = await Promise.all(rows.map(enrichSession));
  res.json(enriched);
});

router.post("/mental-health/sessions", requireAuth, async (req, res) => {
  const { topic, isAnonymous, initialMessage } = req.body;
  if (!topic) {
    res.status(400).json({ error: "validation", message: "topic is required" });
    return;
  }
  const [session] = await db.insert(mentalHealthSessionsTable).values({
    studentId: req.user!.id,
    topic,
    isAnonymous: isAnonymous ?? false,
    status: "requested",
  }).returning();

  if (initialMessage) {
    await db.insert(messagesTable).values({
      sessionId: session.id,
      senderId: req.user!.id,
      content: initialMessage,
    });
  }

  await logAudit(req, "create_mental_health_session", "mental_health_session", session.id);
  res.status(201).json(await enrichSession(session));
});

router.get("/mental-health/sessions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(mentalHealthSessionsTable).where(eq(mentalHealthSessionsTable.id, id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(await enrichSession(row));
});

router.put("/mental-health/sessions/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { notes, status } = req.body;
  const [existing] = await db.select().from(mentalHealthSessionsTable).where(eq(mentalHealthSessionsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const updateData: Partial<typeof mentalHealthSessionsTable.$inferSelect> = {};
  if (notes != null) updateData.notes = notes;
  if (status) {
    updateData.status = status;
    if (status === "active" && !existing.counselorId) {
      updateData.counselorId = req.user!.id;
    }
  }
  const [updated] = await db.update(mentalHealthSessionsTable)
    .set(updateData)
    .where(eq(mentalHealthSessionsTable.id, id))
    .returning();
  await logAudit(req, "update_mental_health_session", "mental_health_session", id);
  if (existing.studentId && status === "active") {
    await createNotification(existing.studentId, "Counseling Session Started", "A counselor has accepted your session request", "counseling");
  }
  res.json(await enrichSession(updated));
});

router.get("/mental-health/messages/:sessionId", requireAuth, async (req, res) => {
  const sessionId = Number(req.params.sessionId);
  const rows = await db.select().from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(messagesTable.createdAt);

  const [session] = await db.select().from(mentalHealthSessionsTable).where(eq(mentalHealthSessionsTable.id, sessionId)).limit(1);

  const enriched = await Promise.all(rows.map(async (m) => {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, m.senderId)).limit(1);
    const { passwordHash: _, ...fullSender } = sender ?? { passwordHash: "", id: m.senderId, name: "Unknown", email: "", role: "student", status: "active", createdAt: new Date(), updatedAt: new Date(), studentNumber: null, phone: null };

    // If the session is anonymous, hide identifying details for messages from the student
    let safeSender: any = fullSender;
    if (session && session.isAnonymous && fullSender?.id === session.studentId) {
      safeSender = {
        id: fullSender.id,
        name: "Anonymous",
        role: fullSender.role,
        status: fullSender.status,
        createdAt: fullSender.createdAt,
      };
    }

    return { ...m, sender: safeSender };
  }));

  res.json(enriched);
});

router.post("/mental-health/messages/:sessionId", requireAuth, async (req, res) => {
  const sessionId = Number(req.params.sessionId);
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

  const [session] = await db.select().from(mentalHealthSessionsTable).where(eq(mentalHealthSessionsTable.id, sessionId)).limit(1);
  if (session) {
    const targetId = req.user!.id === session.studentId ? session.counselorId : session.studentId;
    if (targetId) {
      await createNotification(targetId, "New Message", "You have a new message in your counseling session", "counseling");
    }
  }

  const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, msg.senderId)).limit(1);
  const { passwordHash: _, ...fullSender } = sender ?? { passwordHash: "", id: msg.senderId, name: "Unknown", email: "", role: "student", status: "active", createdAt: new Date(), updatedAt: new Date(), studentNumber: null, phone: null };

  let safeSender: any = fullSender;
  if (session && session.isAnonymous && fullSender?.id === session.studentId) {
    safeSender = {
      id: fullSender.id,
      name: "Anonymous",
      role: fullSender.role,
      status: fullSender.status,
      createdAt: fullSender.createdAt,
    };
  }

  res.status(201).json({ ...msg, sender: safeSender });
});

export default router;
