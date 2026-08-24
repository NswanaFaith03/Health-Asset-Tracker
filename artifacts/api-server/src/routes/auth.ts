/**
 * @module Auth Routes
 * @file auth.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq, ilike } from "drizzle-orm";
import { requireAuth, signToken } from "../middlewares/auth";
import { logAudit } from "../lib/audit";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { name, email, password, role, studentNumber, phone } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "validation", message: "name, email, password, and role are required" });
    return;
  }
  if (role !== "student") {
    res.status(403).json({
      error: "forbidden",
      message: "Only student accounts can be registered directly. Staff accounts must be created by an admin.",
    });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await db.select().from(usersTable).where(ilike(usersTable.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "conflict", message: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    studentNumber: studentNumber ?? null,
    phone: phone ?? null,
    status: "pending",
    requiresPasswordReset: false,
  }).returning();
  const { passwordHash: _, ...safeUser } = user;
  await logAudit(req, "register", "user", user.id);
  res.status(201).json({
    message: "Account created. Your student account is pending admin approval.",
    user: safeUser,
  });
});

router.post("/admin/users", requireAuth, async (req, res) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "forbidden", message: "Only admins can create staff accounts" });
    return;
  }

  const { name, email, password, role, studentNumber, phone } = req.body;
  if (!name || !email || !password || !role) {
    res.status(400).json({ error: "validation", message: "name, email, password, and role are required" });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await db.select().from(usersTable).where(ilike(usersTable.email, normalizedEmail)).limit(1);
  if (existing.length > 0) {
    res.status(400).json({ error: "conflict", message: "Email already registered" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    name,
    email: normalizedEmail,
    passwordHash,
    role,
    studentNumber: role === "student" ? (studentNumber ?? null) : null,
    phone: phone ?? null,
    status: "active",
    requiresPasswordReset: true,
  }).returning();

  const { passwordHash: _, ...safeUser } = user;
  await logAudit(req, "admin_create_user", "user", user.id);
  res.status(201).json({ user: safeUser });
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "validation", message: "email and password are required" });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const [user] = await db.select().from(usersTable).where(ilike(usersTable.email, normalizedEmail)).limit(1);
  if (!user) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
    return;
  }
  if (user.status === "pending") {
    res.status(401).json({ error: "pending", message: "Your account is awaiting admin approval. Please check back later." });
    return;
  }
  if (user.status !== "active") {
    res.status(401).json({ error: "unauthorized", message: "Account is not active" });
    return;
  }
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { passwordHash: _, ...safeUser } = user;
  await logAudit(req, "login", "user", user.id);
  res.json({ token, user: safeUser });
});

router.post("/auth/logout", requireAuth, async (req, res) => {
  await logAudit(req, "logout", "user", req.user!.id);
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

router.post("/auth/change-password", requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(400).json({ error: "validation", message: "Current password is incorrect" });
    return;
  }
  const newHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash: newHash, requiresPasswordReset: false }).where(eq(usersTable.id, user.id));
  await logAudit(req, "change_password", "user", user.id);
  res.json({ success: true, message: "Password changed" });
});

router.post("/auth/forgot-password", async (req, res) => {
  const { email, studentNumber, newPassword } = req.body;
  if (!email || !studentNumber || !newPassword) {
    res.status(400).json({ error: "validation", message: "email, studentNumber, and newPassword are required" });
    return;
  }
  const normalizedEmail = email.toLowerCase().trim();
  const [user] = await db.select().from(usersTable).where(ilike(usersTable.email, normalizedEmail)).limit(1);
  if (!user) {
    res.status(404).json({ error: "not_found", message: "User not found" });
    return;
  }
  if (user.role !== "student") {
    res.status(403).json({
      error: "forbidden",
      message: "Only students can reset their password via this screen. Other roles must request a password reset from the admin.",
    });
    return;
  }
  if (!user.studentNumber || user.studentNumber.trim().toLowerCase() !== studentNumber.trim().toLowerCase()) {
    res.status(400).json({ error: "validation", message: "Invalid student number for this email" });
    return;
  }
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable)
    .set({ passwordHash, requiresPasswordReset: false })
    .where(eq(usersTable.id, user.id));
  await logAudit(req, "forgot_password_reset", "user", user.id);
  res.json({ success: true, message: "Password reset successful" });
});

export default router;
