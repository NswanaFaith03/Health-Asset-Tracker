import bcrypt from "bcryptjs";
import { db, usersTable, consultationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export async function seedDefaultAdmin() {
  console.log("🌱 Seeding default admin account...");

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, "root@unza.zm")).limit(1);
  if (existing.length > 0) {
    console.log("✅ Admin account already exists, skipping.");
    return { created: false };
  }

  const passwordHash = await bcrypt.hash("adminadmin", 10);
  const [user] = await db.insert(usersTable).values({
    name: "Root Admin",
    email: "root@unza.zm",
    passwordHash,
    role: "admin",
    status: "active",
  }).returning();

  console.log("✅ Default admin created.");
  console.log("   Email:    root@unza.zm");
  console.log("   Password: adminadmin");
  return { created: true, user };
}

export async function migrateConsultationSchema() {
  console.log("🔄 Migrating consultation schema...");
  
  try {
    // Add new columns if they don't exist
    await db.execute(`
      ALTER TABLE consultations 
      ADD COLUMN IF NOT EXISTS dismissal_reason TEXT,
      ADD COLUMN IF NOT EXISTS resolution_reason TEXT,
      ADD COLUMN IF NOT EXISTS information_requests JSONB DEFAULT '[]'::jsonb
    `);
    console.log("✅ Consultation schema migrated successfully");
    return { success: true };
  } catch (err) {
    console.error("❌ Migration failed:", err);
    return { success: false, error: err };
  }
}

// If executed directly (cli), run and exit with appropriate code
if (process.env.SEED_EXEC === "true") {
  seedDefaultAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
