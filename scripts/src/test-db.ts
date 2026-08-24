import fsPath from "fs";
import path from "path";

// Get workspace root
const workspaceRoot = path.resolve(import.meta.dirname, "../..");

// 1. Read environment variables from .env.local
const envPath = path.resolve(workspaceRoot, ".env.local");
let envData = "";
try {
  envData = fsPath.readFileSync(envPath, "utf-8");
} catch (e) {}

envData.split("\n").forEach((line) => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;
  const idx = trimmed.indexOf("=");
  if (idx === -1) return;
  const key = trimmed.substring(0, idx).trim();
  let val = trimmed.substring(idx + 1).trim();
  if (val.startsWith('"') && val.endsWith('"')) {
    val = val.substring(1, val.length - 1);
  }
  process.env[key] = val;
});

async function main() {
  const { db, usersTable } = await import("../../lib/db/src/index");
  console.log("Attempting to insert test user directly...");
  
  const randomEmail = `test-direct-insert-${Date.now()}@unza.zm`;
  
  const [inserted] = await db.insert(usersTable).values({
    name: "Direct Insert Test",
    email: randomEmail,
    passwordHash: "dummy-hash",
    role: "student",
    status: "pending",
    requiresPasswordReset: false,
  }).returning();

  console.log("Success! Inserted user with ID:", inserted.id, "and Status:", inserted.status);
  process.exit(0);
}

main().catch((err) => {
  console.error("Direct insert failed:", err);
  process.exit(1);
});
