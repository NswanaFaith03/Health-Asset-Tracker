import { Router } from "express";
import { db, appSettingsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";
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

export default router;
