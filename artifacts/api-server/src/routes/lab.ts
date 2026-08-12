import { Router } from "express";
import { db, labRequestsTable, labResultsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { createNotification } from "../lib/notify";

const router = Router();

async function enrichRequest(r: typeof labRequestsTable.$inferSelect) {
  const [patient] = await db.select().from(usersTable).where(eq(usersTable.id, r.patientId)).limit(1);
  const [doctor] = await db.select().from(usersTable).where(eq(usersTable.id, r.doctorId)).limit(1);
  const [result] = await db.select().from(labResultsTable).where(eq(labResultsTable.requestId, r.id)).limit(1);
  const safeUser = (u: typeof usersTable.$inferSelect | undefined) => {
    if (!u) return null;
    const { passwordHash: _, ...safe } = u;
    return safe;
  };
  return { ...r, patient: safeUser(patient), doctor: safeUser(doctor), result: result ?? null };
}

router.get("/lab-requests", requireAuth, async (req, res) => {
  const { status, patientId } = req.query;
  const user = req.user!;

  let rows: typeof labRequestsTable.$inferSelect[];
  if (user.role === "student") {
    const conditions = [eq(labRequestsTable.patientId, user.id)];
    if (status) conditions.push(eq(labRequestsTable.status, String(status)));
    rows = await db.select().from(labRequestsTable).where(and(...conditions)).orderBy(labRequestsTable.createdAt);
  } else {
    const conditions: ReturnType<typeof eq>[] = [];
    if (status) conditions.push(eq(labRequestsTable.status, String(status)));
    if (patientId) conditions.push(eq(labRequestsTable.patientId, Number(patientId)));
    rows = conditions.length > 0
      ? await db.select().from(labRequestsTable).where(and(...conditions)).orderBy(labRequestsTable.createdAt)
      : await db.select().from(labRequestsTable).orderBy(labRequestsTable.createdAt);
  }

  const enriched = await Promise.all(rows.map(enrichRequest));
  res.json(enriched);
});

router.post("/lab-requests", requireAuth, async (req, res) => {
  const { patientId, consultationId, testType, notes } = req.body;
  if (!patientId || !testType) {
    res.status(400).json({ error: "validation", message: "patientId and testType are required" });
    return;
  }
  const [row] = await db.insert(labRequestsTable).values({
    patientId,
    doctorId: req.user!.id,
    consultationId: consultationId ?? null,
    testType,
    notes: notes ?? null,
    status: "pending",
  }).returning();
  await logAudit(req, "create_lab_request", "lab_request", row.id);
  await createNotification(patientId, "Lab Test Requested", `A ${testType} lab test has been requested for you`, "lab_result");
  res.status(201).json(await enrichRequest(row));
});

router.get("/lab-requests/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(labRequestsTable).where(eq(labRequestsTable.id, id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(await enrichRequest(row));
});

router.patch("/lab-requests/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const user = req.user!;

  // Only nurses, lab_technicians, and admins can update lab request status
  if (!["nurse", "lab_technician", "admin"].includes(user.role)) {
    res.status(403).json({ error: "forbidden", message: "Only nurses, lab technicians, and admins can update lab request status" });
    return;
  }

  const [updated] = await db.update(labRequestsTable)
    .set({ status })
    .where(eq(labRequestsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await logAudit(req, "update_lab_request_status", "lab_request", id, `status=${status}`);
  res.json(await enrichRequest(updated));
});

router.post("/lab-results", requireAuth, async (req, res) => {
  const { requestId, results, attachment } = req.body;
  const user = req.user!;

  // Only nurses, lab_technicians, and admins can upload lab results
  if (!["nurse", "lab_technician", "admin"].includes(user.role)) {
    res.status(403).json({ error: "forbidden", message: "Only nurses, lab technicians, and admins can upload lab results" });
    return;
  }

  if (!requestId || !results) {
    res.status(400).json({ error: "validation", message: "requestId and results are required" });
    return;
  }
  const [row] = await db.insert(labResultsTable).values({
    requestId,
    results,
    attachment: attachment ?? null,
    uploadedBy: user.id,
  }).returning();

  const [request] = await db.select().from(labRequestsTable).where(eq(labRequestsTable.id, requestId)).limit(1);
  if (request) {
    await db.update(labRequestsTable).set({ status: "completed" }).where(eq(labRequestsTable.id, requestId));
    await createNotification(request.patientId, "Lab Results Ready", "Your laboratory test results are now available", "lab_result");
  }

  await logAudit(req, "upload_lab_result", "lab_result", row.id);
  res.status(201).json(row);
});

router.get("/lab-results/:requestId", requireAuth, async (req, res) => {
  const requestId = Number(req.params.requestId);
  const [row] = await db.select().from(labResultsTable).where(eq(labResultsTable.requestId, requestId)).limit(1);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(row);
});

export default router;
