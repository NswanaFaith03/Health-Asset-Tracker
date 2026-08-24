/**
 * @module Consultation Routes
 * @file consultations.ts
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, consultationsTable, usersTable, queueTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { createNotification } from "../lib/notify";

const router = Router();

// Modular consultation action system
interface ConsultationAction {
  action: "dismiss" | "resolve" | "request_info" | "respond_to_info";
  reason?: string;
  userId: number;
  requestId?: string;
}

// Role-based consultation action permissions
const ACTION_PERMISSIONS: Record<string, string[]> = {
  dismiss: ["doctor", "admin"],
  resolve: ["doctor", "admin"],
  request_info: ["doctor", "nurse", "admin"],
  respond_to_info: ["student"],
};

async function canPerformAction(action: string, userRole: string): Promise<boolean> {
  const allowedRoles = ACTION_PERMISSIONS[action] || [];
  return allowedRoles.includes(userRole);
}

async function getNextQueueNumber() {
  const allWaiting = await db.select().from(queueTable).where(eq(queueTable.status, "waiting"));
  return allWaiting.length > 0 ? Math.max(...allWaiting.map((entry) => entry.queueNumber)) + 1 : 1;
}

async function enrichConsultation(c: typeof consultationsTable.$inferSelect) {
  const [student] = await db.select().from(usersTable).where(eq(usersTable.id, c.studentId)).limit(1);
  let doctor = null;
  if (c.doctorId) {
    const [d] = await db.select().from(usersTable).where(eq(usersTable.id, c.doctorId)).limit(1);
    if (d) {
      const { passwordHash: _, ...safe } = d;
      doctor = safe;
    }
  }
  const { passwordHash: _, ...safeStudent } = student ?? { passwordHash: "", id: c.studentId, name: "Unknown", email: "", role: "student", status: "active", createdAt: new Date(), updatedAt: new Date(), studentNumber: null, phone: null };
  return { ...c, student: safeStudent, doctor };
}

router.get("/consultations", requireAuth, async (req, res) => {
  const { status, studentId, doctorId } = req.query;
  const user = req.user!;

  let rows: typeof consultationsTable.$inferSelect[];

  if (user.role === "student") {
    const conditions = [eq(consultationsTable.studentId, user.id)];
    if (status) conditions.push(eq(consultationsTable.status, String(status)));
    rows = await db.select().from(consultationsTable).where(and(...conditions)).orderBy(consultationsTable.createdAt);
  } else if (user.role === "doctor") {
    const conditions = doctorId
      ? [eq(consultationsTable.doctorId, Number(doctorId))]
      : [eq(consultationsTable.doctorId, user.id)];
    if (status) conditions.push(eq(consultationsTable.status, String(status)));
    const allSubmitted = await db.select().from(consultationsTable).where(eq(consultationsTable.status, "submitted")).orderBy(consultationsTable.createdAt);
    const myConsultations = await db.select().from(consultationsTable).where(and(...conditions)).orderBy(consultationsTable.createdAt);
    const ids = new Set(myConsultations.map((c) => c.id));
    rows = [...myConsultations, ...allSubmitted.filter((c) => !ids.has(c.id))];
  } else {
    let conditions: ReturnType<typeof eq>[] = [];
    if (status) conditions.push(eq(consultationsTable.status, String(status)));
    if (studentId) conditions.push(eq(consultationsTable.studentId, Number(studentId)));
    rows = conditions.length > 0
      ? await db.select().from(consultationsTable).where(and(...conditions)).orderBy(consultationsTable.createdAt)
      : await db.select().from(consultationsTable).orderBy(consultationsTable.createdAt);
  }

  const enriched = await Promise.all(rows.map(enrichConsultation));
  res.json(enriched);
});

router.post("/consultations", requireAuth, async (req, res) => {
  const { symptoms, severity, attachments } = req.body;
  if (!symptoms || !severity) {
    res.status(400).json({ error: "validation", message: "symptoms and severity are required" });
    return;
  }
  const [row] = await db.insert(consultationsTable).values({
    studentId: req.user!.id,
    symptoms,
    severity,
    attachments: attachments ?? [],
    status: "submitted",
  }).returning();

  const existingQueueEntry = await db.select().from(queueTable)
    .where(and(eq(queueTable.consultationId, row.id), eq(queueTable.status, "waiting")))
    .limit(1);

  if (existingQueueEntry.length === 0) {
    const queueNumber = await getNextQueueNumber();
    await db.insert(queueTable).values({
      consultationId: row.id,
      studentId: req.user!.id,
      queueNumber,
      status: "waiting",
      estimatedWaitMinutes: queueNumber * 15,
    });
  }

  await logAudit(req, "create_consultation", "consultation", row.id);
  res.status(201).json(await enrichConsultation(row));
});

router.get("/consultations/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [row] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(await enrichConsultation(row));
});

router.put("/consultations/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const {
    diagnosis,
    notes,
    status,
    temperature,
    bloodPressure,
    heartRate,
    respiratoryRate,
    oxygenSaturation,
    weight,
  } = req.body;

  const [existing] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const vitalsProvided = [temperature, bloodPressure, heartRate, respiratoryRate, oxygenSaturation, weight].some((value) => value !== undefined);
  if (vitalsProvided && !["nurse", "admin"].includes(req.user!.role)) {
    res.status(403).json({ error: "forbidden", message: "Only nurses or admins can record vitals" });
    return;
  }

  const updateData: Partial<typeof consultationsTable.$inferSelect> = {};
  if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
  if (notes !== undefined) updateData.notes = notes;
  if (status !== undefined) updateData.status = status;
  if (temperature !== undefined) updateData.temperature = temperature;
  if (bloodPressure !== undefined) updateData.bloodPressure = bloodPressure;
  if (heartRate !== undefined) updateData.heartRate = heartRate;
  if (respiratoryRate !== undefined) updateData.respiratoryRate = respiratoryRate;
  if (oxygenSaturation !== undefined) updateData.oxygenSaturation = oxygenSaturation;
  if (weight !== undefined) updateData.weight = weight;

  const [updated] = await db.update(consultationsTable)
    .set({ ...updateData, status: status ?? existing.status })
    .where(eq(consultationsTable.id, id))
    .returning();
  await logAudit(req, "update_consultation", "consultation", id);
  if (status === "responded" && existing.studentId) {
    await createNotification(existing.studentId, "Consultation Responded", "Your consultation has been responded to by the doctor", "consultation");
  }
  res.json(await enrichConsultation(updated));
});

router.patch("/consultations/:id/status", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { status, doctorId } = req.body;
  const [existing] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, id)).limit(1);
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const updateData: Partial<typeof consultationsTable.$inferSelect> = { status };
  if (doctorId) updateData.doctorId = doctorId;
  const [updated] = await db.update(consultationsTable)
    .set(updateData)
    .where(eq(consultationsTable.id, id))
    .returning();
  await logAudit(req, "update_consultation_status", "consultation", id, `status=${status}`);
  if (existing.studentId) {
    await createNotification(existing.studentId, "Consultation Updated", `Your consultation status is now: ${status}`, "consultation");
  }
  res.json(await enrichConsultation(updated));
});

// New modular consultation action endpoints
router.post("/consultations/:id/actions", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const { action, reason, requestId } = req.body;
  const user = req.user!;

  if (!action) {
    return res.status(400).json({ error: "validation", message: "action is required" });
  }

  const hasPermission = await canPerformAction(action, user.role);
  if (!hasPermission) {
    return res.status(403).json({ error: "forbidden", message: `User role ${user.role} cannot perform action ${action}` });
  }

  const [existing] = await db.select().from(consultationsTable).where(eq(consultationsTable.id, id)).limit(1);
  if (!existing) {
    return res.status(404).json({ error: "not_found" });
  }

  try {
    const updateData: Partial<typeof consultationsTable.$inferSelect> = {};
    let notificationMessage = "";
    let notificationTitle = "";
    const actorName = (user as any)?.name ?? "User";

    switch (action) {
      case "dismiss":
        if (!reason) {
          return res.status(400).json({ error: "validation", message: "reason is required for dismissal" });
        }
        updateData.status = "dismissed";
        updateData.dismissalReason = reason;
        notificationTitle = "Consultation Dismissed";
        notificationMessage = `Your consultation has been dismissed by the doctor. Reason: ${reason}`;
        break;

      case "resolve":
        if (!reason) {
          return res.status(400).json({ error: "validation", message: "reason is required for resolution" });
        }
        updateData.status = "resolved";
        updateData.resolutionReason = reason;
        notificationTitle = "Consultation Resolved";
        notificationMessage = `Your consultation has been resolved. Reason: ${reason}`;
        break;

      case "request_info":
        if (!reason) {
          return res.status(400).json({ error: "validation", message: "information request message is required" });
        }
        const currentRequests = (existing.informationRequests as any[]) || [];
        const newRequestId = `req_${Date.now()}_${user.id}`;
        currentRequests.push({
          id: newRequestId,
          userId: user.id,
          userName: actorName,
          role: user.role,
          message: reason,
          timestamp: new Date().toISOString(),
          response: null,
        });
        updateData.informationRequests = currentRequests;
        notificationTitle = "Information Request";
        notificationMessage = `${actorName} (${user.role}) requested additional information for your consultation`;
        break;

      case "respond_to_info":
        if (!requestId) {
          return res.status(400).json({ error: "validation", message: "requestId is required for response" });
        }
        const infoRequests = (existing.informationRequests as any[]) || [];
        const requestIndex = infoRequests.findIndex((r: any) => r.id === requestId);
        if (requestIndex === -1) {
          return res.status(404).json({ error: "not_found", message: "Information request not found" });
        }
        infoRequests[requestIndex].response = reason;
        infoRequests[requestIndex].respondedAt = new Date().toISOString();
        updateData.informationRequests = infoRequests;
        notificationTitle = "Information Response";
        notificationMessage = `Your response to the information request has been recorded`;
        break;

      default:
        return res.status(400).json({ error: "validation", message: `Invalid action: ${action}` });
    }

    const [updated] = await db.update(consultationsTable)
      .set(updateData)
      .where(eq(consultationsTable.id, id))
      .returning();

    await logAudit(req, `consultation_action_${action}`, "consultation", id, `reason=${reason}`);

    if (notificationTitle && existing.studentId) {
      await createNotification(existing.studentId, notificationTitle, notificationMessage, "consultation");
    }

    return res.json(await enrichConsultation(updated));
  } catch (err) {
    console.error("Error performing consultation action:", err);
    return res.status(500).json({ error: "Failed to perform action" });
  }
});

export default router;
