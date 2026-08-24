/**
 * @module Admin Routes
 * @file admin.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, usersTable, consultationsTable, prescriptionsTable, labRequestsTable, mentalHealthSessionsTable, auditLogsTable, queueTable, appSettingsTable } from "@workspace/db";
import { count, sql, desc, eq } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/admin/analytics", requireAuth, requireRole("admin"), async (req, res) => {
  const [totalUsers] = await db.select({ count: count() }).from(usersTable);
  const [totalConsultations] = await db.select({ count: count() }).from(consultationsTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [consultsToday] = await db.select({ count: count() }).from(consultationsTable)
    .where(sql`${consultationsTable.createdAt} >= ${today}`);

  const [prescriptions] = await db.select({ count: count() }).from(prescriptionsTable);
  const [labTests] = await db.select({ count: count() }).from(labRequestsTable);
  const [counseling] = await db.select({ count: count() }).from(mentalHealthSessionsTable);

  const allQueueEntries = await db.select().from(queueTable);
  const completed = allQueueEntries.filter((e) => e.status === "completed");
  const avgWait = completed.length > 0
    ? completed.reduce((sum, e) => sum + (e.estimatedWaitMinutes ?? 15), 0) / completed.length
    : 15;

  const usersByRole = await db.select({
    role: usersTable.role,
    count: count(),
  }).from(usersTable).groupBy(usersTable.role);

  const roleMap: Record<string, number> = {};
  for (const r of usersByRole) {
    roleMap[r.role] = Number(r.count);
  }

  res.json({
    totalUsers: Number(totalUsers?.count ?? 0),
    totalConsultations: Number(totalConsultations?.count ?? 0),
    consultationsToday: Number(consultsToday?.count ?? 0),
    averageWaitMinutes: Math.round(avgWait),
    activePatients: Number(totalUsers?.count ?? 0),
    prescriptionsIssued: Number(prescriptions?.count ?? 0),
    labTestsCompleted: Number(labTests?.count ?? 0),
    counselingSessions: Number(counseling?.count ?? 0),
    usersByRole: roleMap,
  });
});

router.get("/admin/audit-logs", requireAuth, requireRole("admin"), async (req, res) => {
  const limit = Number(req.query.limit ?? 50);
  const rows = await db.select().from(auditLogsTable)
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(limit);
  res.json(rows);
});

router.get("/admin/emergency-phone", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const [setting] = await db.select({ value: appSettingsTable.value })
      .from(appSettingsTable)
      .where(eq(appSettingsTable.key, "emergency_phone"))
      .limit(1);

    res.json({ emergencyNumber: setting?.value ?? "" });
  } catch (err) {
    console.error("Error fetching emergency phone", err);
    res.status(500).json({ error: "Failed to fetch emergency phone" });
  }
});

router.put("/admin/emergency-phone", requireAuth, requireRole("admin"), async (req, res) => {
  const { emergencyNumber } = req.body;
  if (!emergencyNumber || typeof emergencyNumber !== "string") {
    return res.status(400).json({ error: "Invalid emergencyNumber" });
  }

  try {
    const [existing] = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "emergency_phone")).limit(1);
    
    if (existing) {
      await db.update(appSettingsTable)
        .set({ value: emergencyNumber })
        .where(eq(appSettingsTable.key, "emergency_phone"));
    } else {
      await db.insert(appSettingsTable).values({ key: "emergency_phone", value: emergencyNumber });
    }

    return res.json({ emergencyNumber });
  } catch (err) {
    console.error("Error saving emergency phone", err);
    return res.status(500).json({ error: "Failed to save emergency phone" });
  }
});

export default router;
