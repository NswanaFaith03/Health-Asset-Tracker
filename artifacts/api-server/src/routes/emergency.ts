import { Router } from "express";
import { db, appSettingsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/emergency/phone", requireAuth, async (req, res) => {
  const settings = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "emergency_phone"));
  res.json({ emergencyNumber: settings?.[0]?.value ?? null });
});

router.post("/emergency/calls", requireAuth, async (req, res) => {
  const { latitude, longitude } = req.body;
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    res.status(400).json({ error: "invalid_request", message: "Coordinates must be numeric." });
    return;
  }

  await logAudit(req, "emergency_call", "user", req.user!.id, `lat=${latitude.toFixed(6)},lng=${longitude.toFixed(6)}`);
  res.json({ success: true });
});

router.get("/admin/emergency-phone", requireAuth, requireRole("admin"), async (req, res) => {
  const settings = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "emergency_phone"));
  res.json({ emergencyNumber: settings?.[0]?.value ?? null });
});

router.put("/admin/emergency-phone", requireAuth, requireRole("admin"), async (req, res) => {
  const { emergencyNumber } = req.body;
  if (!emergencyNumber || typeof emergencyNumber !== "string") {
    res.status(400).json({ error: "invalid_request", message: "Emergency number must be a string." });
    return;
  }

  const existing = await db.select().from(appSettingsTable).where(eq(appSettingsTable.key, "emergency_phone"));
  if (existing.length > 0) {
    await db.update(appSettingsTable).set({ value: emergencyNumber }).where(eq(appSettingsTable.key, "emergency_phone"));
  } else {
    await db.insert(appSettingsTable).values({ key: "emergency_phone", value: emergencyNumber });
  }

  await logAudit(req, "update_emergency_phone", "app_settings", 0, `number=${emergencyNumber}`);
  res.json({ success: true, emergencyNumber });
});

export default router;
