/**
 * @module Emergency Routes
 * @file emergency.ts
 * @developer Faith
 * @role Senior Student Experience Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import { db, appSettingsTable } from "@workspace/db";
import { requireAuth, requireRole } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import { eq } from "drizzle-orm";

const router = Router();

async function getEmergencyNumberSetting() {
  const [setting] = await db.select({ value: appSettingsTable.value })
    .from(appSettingsTable)
    .where(eq(appSettingsTable.key, "emergency_phone"))
    .limit(1);

  return setting?.value ?? null;
}

async function saveEmergencyNumberSetting(emergencyNumber: string) {
  const [existing] = await db.select().from(appSettingsTable)
    .where(eq(appSettingsTable.key, "emergency_phone"))
    .limit(1);

  if (existing) {
    await db.update(appSettingsTable)
      .set({ value: emergencyNumber })
      .where(eq(appSettingsTable.key, "emergency_phone"));
  } else {
    await db.insert(appSettingsTable).values({ key: "emergency_phone", value: emergencyNumber });
  }

  return emergencyNumber;
}

router.get("/emergency/phone", requireAuth, async (req, res) => {
  try {
    const emergencyNumber = await getEmergencyNumberSetting();
    res.json({ emergencyNumber });
  } catch (error) {
    console.error("Error fetching emergency phone", error);
    res.status(500).json({ error: "Failed to fetch emergency phone" });
  }
});

router.get("/admin/emergency-phone", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const emergencyNumber = await getEmergencyNumberSetting();
    res.json({ emergencyNumber: emergencyNumber ?? "" });
  } catch (error) {
    console.error("Error fetching emergency phone", error);
    res.status(500).json({ error: "Failed to fetch emergency phone" });
  }
});

router.put("/admin/emergency-phone", requireAuth, requireRole("admin"), async (req, res) => {
  const { emergencyNumber } = req.body;
  if (!emergencyNumber || typeof emergencyNumber !== "string") {
    return res.status(400).json({ error: "Invalid emergencyNumber" });
  }

  try {
    const saved = await saveEmergencyNumberSetting(emergencyNumber);
    return res.json({ emergencyNumber: saved });
  } catch (error) {
    console.error("Error saving emergency phone", error);
    return res.status(500).json({ error: "Failed to save emergency phone" });
  }
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
