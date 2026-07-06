import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
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

// If executed directly (cli), run and exit with appropriate code
if (process.env.SEED_EXEC === "true") {
  seedDefaultAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
