/**
 * @module Notification Routes
 * @file notifications.ts
 * @developer Faith
 * @role Senior Student Experience Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/notifications", requireAuth, async (req, res) => {
  const rows = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.id))
    .orderBy(notificationsTable.createdAt);
  res.json(rows.reverse());
});

router.patch("/notifications/:id/read", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [updated] = await db.update(notificationsTable)
    .set({ readStatus: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.id)))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(updated);
});

router.patch("/notifications/read-all", requireAuth, async (req, res) => {
  await db.update(notificationsTable)
    .set({ readStatus: true })
    .where(eq(notificationsTable.userId, req.user!.id));
  res.json({ success: true, message: "All notifications marked as read" });
});

export default router;
