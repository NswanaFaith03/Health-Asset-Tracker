import { Router } from "express";
import { db, usersTable, consultationsTable, prescriptionsTable, labRequestsTable, mentalHealthSessionsTable, auditLogsTable, queueTable } from "@workspace/db";
import { count, sql, desc } from "drizzle-orm";
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

export default router;
