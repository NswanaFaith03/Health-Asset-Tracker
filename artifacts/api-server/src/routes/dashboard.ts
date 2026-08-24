/**
 * @module Dashboard Routes
 * @file dashboard.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, consultationsTable, prescriptionsTable, labRequestsTable, notificationsTable, queueTable } from "@workspace/db";
import { eq, and, count, sql } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/dashboard/student", requireAuth, async (req, res) => {
  const userId = req.user!.id;

  const [activeConsults] = await db.select({ count: count() }).from(consultationsTable)
    .where(and(eq(consultationsTable.studentId, userId), sql`${consultationsTable.status} NOT IN ('closed')`));

  const [pendingRx] = await db.select({ count: count() }).from(prescriptionsTable)
    .where(and(eq(prescriptionsTable.patientId, userId), eq(prescriptionsTable.status, "pending")));

  const [pendingLab] = await db.select({ count: count() }).from(labRequestsTable)
    .where(and(eq(labRequestsTable.patientId, userId), sql`${labRequestsTable.status} NOT IN ('completed', 'cancelled')`));

  const [unreadNotifs] = await db.select({ count: count() }).from(notificationsTable)
    .where(and(eq(notificationsTable.userId, userId), eq(notificationsTable.readStatus, false)));

  const recentConsultations = await db.select().from(consultationsTable)
    .where(eq(consultationsTable.studentId, userId))
    .orderBy(sql`${consultationsTable.createdAt} DESC`)
    .limit(5);

  const myQueueEntry = await db.select().from(queueTable)
    .where(and(eq(queueTable.studentId, userId), eq(queueTable.status, "waiting")))
    .limit(1);

  let queuePosition = null;
  if (myQueueEntry.length > 0) {
    const allWaiting = await db.select().from(queueTable)
      .where(eq(queueTable.status, "waiting"))
      .orderBy(queueTable.queueNumber);
    const pos = allWaiting.findIndex((e) => e.studentId === userId) + 1;
    queuePosition = {
      position: pos,
      queueNumber: myQueueEntry[0].queueNumber,
      estimatedWaitMinutes: pos * 15,
      status: "waiting" as const,
      totalInQueue: allWaiting.length,
    };
  }

  res.json({
    activeConsultations: Number(activeConsults?.count ?? 0),
    pendingPrescriptions: Number(pendingRx?.count ?? 0),
    pendingLabResults: Number(pendingLab?.count ?? 0),
    unreadNotifications: Number(unreadNotifs?.count ?? 0),
    queuePosition,
    recentConsultations,
  });
});

router.get("/dashboard/doctor", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayConsults] = await db.select({ count: count() }).from(consultationsTable)
    .where(and(eq(consultationsTable.doctorId, userId), sql`${consultationsTable.createdAt} >= ${today}`));

  const [pendingReviews] = await db.select({ count: count() }).from(consultationsTable)
    .where(eq(consultationsTable.status, "submitted"));

  const [queueSize] = await db.select({ count: count() }).from(queueTable)
    .where(eq(queueTable.status, "waiting"));

  const [rxToday] = await db.select({ count: count() }).from(prescriptionsTable)
    .where(and(eq(prescriptionsTable.doctorId, userId), sql`${prescriptionsTable.createdAt} >= ${today}`));

  const [labToday] = await db.select({ count: count() }).from(labRequestsTable)
    .where(and(eq(labRequestsTable.doctorId, userId), sql`${labRequestsTable.createdAt} >= ${today}`));

  const recentPatients = await db.select().from(consultationsTable)
    .where(eq(consultationsTable.doctorId, userId))
    .orderBy(sql`${consultationsTable.updatedAt} DESC`)
    .limit(5);

  res.json({
    todayConsultations: Number(todayConsults?.count ?? 0),
    pendingReviews: Number(pendingReviews?.count ?? 0),
    currentQueueSize: Number(queueSize?.count ?? 0),
    prescriptionsToday: Number(rxToday?.count ?? 0),
    labRequestsToday: Number(labToday?.count ?? 0),
    recentPatients,
  });
});

export default router;
