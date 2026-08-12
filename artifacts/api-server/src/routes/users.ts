import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or } from "drizzle-orm";
import { requireAuth, requireRole } from "../middlewares/auth";
import { logAudit } from "../lib/audit";
import fs from "fs/promises";
import path from "path";

const router = Router();

function safeUser(u: typeof usersTable.$inferSelect) {
  const { passwordHash: _, ...rest } = u;
  return rest;
}

router.get("/users", requireAuth, requireRole("admin"), async (req, res) => {
  const { role, search } = req.query as { role?: string; search?: string };
  let query = db.select().from(usersTable);
  const conditions: ReturnType<typeof eq>[] = [];
  if (role) conditions.push(eq(usersTable.role, role));
  if (search) {
    conditions.push(
      or(
        ilike(usersTable.name, `%${search}%`),
        ilike(usersTable.email, `%${search}%`),
      ) as ReturnType<typeof eq>,
    );
  }
  const users = conditions.length > 0
    ? await db.select().from(usersTable).where(conditions[0])
    : await db.select().from(usersTable);
  res.json(users.map(safeUser));
});

router.get("/users/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(safeUser(user));
});

router.put("/users/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (req.user!.role !== "admin" && req.user!.id !== id) {
    res.status(403).json({ error: "forbidden" });
    return;
  }
  const { name, phone, studentNumber } = req.body;
  const [updated] = await db.update(usersTable)
    .set({ name, phone, studentNumber })
    .where(eq(usersTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await logAudit(req, "update_user", "user", id);
  res.json(safeUser(updated));
});

router.patch("/users/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const [updated] = await db.update(usersTable)
    .set({ status })
    .where(eq(usersTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  await logAudit(req, "update_user_status", "user", id, `status=${status}`);
  res.json(safeUser(updated));
});

// Upload avatar as base64 image { filename, data }
router.post("/users/me/avatar", requireAuth, async (req, res) => {
  const userId = req.user!.id;
  const { filename, data } = req.body as { filename?: string; data?: string };
  if (!data || !filename) {
    res.status(400).json({ error: "validation", message: "filename and data (base64) are required" });
    return;
  }

  try {
    const ext = (path.extname(filename) || ".jpg").replace(".", "");
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    const dataUri = `data:${mimeType};base64,${data}`;

    // Update in database directly
    const [updated] = await db.update(usersTable).set({ avatarUrl: dataUri }).where(eq(usersTable.id, userId)).returning();
    if (!updated) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    // Try to write to local filesystem as a fallback for local servers
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const outName = `${userId}-${Date.now()}.${ext}`;
      const outPath = path.join(uploadsDir, outName);
      const buffer = Buffer.from(data, "base64");
      await fs.writeFile(outPath, buffer);
    } catch (fsErr) {
      console.warn("Failed to write avatar to local filesystem (expected on serverless environments like Vercel):", fsErr);
    }

    await logAudit(req, "upload_avatar", "user", userId);
    const { passwordHash: _, ...safe } = updated;
    res.json({ user: safe, url: dataUri });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
