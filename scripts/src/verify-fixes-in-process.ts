import fs from "fs";
import path from "path";

// Get workspace root
const workspaceRoot = path.resolve(import.meta.dirname, "../..");

// 1. Read environment variables from .env.local
const envPath = path.resolve(workspaceRoot, ".env.local");
let envData = "";
try {
  envData = fs.readFileSync(envPath, "utf-8");
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

const PORT = 5656;
process.env.PORT = String(PORT);

async function runTests() {
  console.log("🚀 Importing Express App...");
  const { default: app } = await import("../../artifacts/api-server/src/app");
  
  console.log("👂 Starting server on port", PORT, "...");
  const server = app.listen(PORT);

  try {
    console.log("\n🧪 Running integration tests...");
    const baseUrl = `http://localhost:${PORT}/api`;
    const randomEmail = `verify-student-${Date.now()}@unza.zm`;
    const password = "Password123";

    // TEST 1: Register student
    console.log("\n[Test 1] Registering student (should be pending)...");
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Verify Student",
        email: randomEmail,
        password,
        role: "student",
      }),
    });
    if (regRes.status !== 201) {
      const text = await regRes.text();
      throw new Error(`Registration failed. Status: ${regRes.status}, Body: ${text}`);
    }
    const regData = await regRes.json() as any;
    console.log("  ↳ Registration Success! Student Status:", regData.user?.status);
    if (regData.user?.status !== "pending") {
      throw new Error(`Expected registered student status to be 'pending', got '${regData.user?.status}'`);
    }

    // TEST 2: Attempt login as pending student
    console.log("\n[Test 2] Attempting pending student login...");
    const loginPendingRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: randomEmail,
        password,
      }),
    });
    console.log("  ↳ Response HTTP Status:", loginPendingRes.status);
    const loginPendingData = await loginPendingRes.json() as any;
    console.log("  ↳ Response Body:", JSON.stringify(loginPendingData));
    if (loginPendingRes.status !== 401) {
      throw new Error(`Expected login status 401, got ${loginPendingRes.status}`);
    }
    if (loginPendingData.error !== "pending") {
      throw new Error(`Expected error property 'pending', got '${loginPendingData.error}'`);
    }

    // TEST 3: Admin login
    console.log("\n[Test 3] Authenticating as Root Admin...");
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "root@unza.zm",
        password: "adminadmin",
      }),
    });
    if (adminLoginRes.status !== 200) {
      throw new Error(`Admin login failed. Status: ${adminLoginRes.status}`);
    }
    const adminLoginData = await adminLoginRes.json() as any;
    const adminToken = adminLoginData.token;
    console.log("  ↳ Admin logged in successfully!");

    // TEST 4: Approve student
    console.log("\n[Test 4] Admin approving student status...");
    const approveRes = await fetch(`${baseUrl}/users/${regData.user.id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "active" }),
    });
    if (approveRes.status !== 200) {
      throw new Error(`Admin approval failed. Status: ${approveRes.status}`);
    }
    const approveData = await approveRes.json() as any;
    console.log("  ↳ Status updated. New Status:", approveData.status);

    // TEST 5: Active student login
    console.log("\n[Test 5] Logging in as approved student...");
    const studentLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: randomEmail,
        password,
      }),
    });
    if (studentLoginRes.status !== 200) {
      throw new Error(`Student login failed. Status: ${studentLoginRes.status}`);
    }
    const studentLoginData = await studentLoginRes.json() as any;
    const studentToken = studentLoginData.token;
    console.log("  ↳ Student logged in successfully!");

    // TEST 6: Upload avatar
    console.log("\n[Test 6] Uploading student avatar as base64...");
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const avatarRes = await fetch(`${baseUrl}/users/me/avatar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`,
      },
      body: JSON.stringify({
        filename: "avatar.png",
        data: dummyBase64,
      }),
    });
    if (avatarRes.status !== 200) {
      throw new Error(`Avatar upload failed. Status: ${avatarRes.status}`);
    }
    const avatarData = await avatarRes.json() as any;
    console.log("  ↳ Response URL:", avatarData.url.substring(0, 50) + "...");
    if (!avatarData.url.startsWith("data:image/png;base64,")) {
      throw new Error(`Expected data URI avatar url, got ${avatarData.url}`);
    }

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! ✅");
    server.close();
    process.exit(0);
  } catch (err: any) {
    console.error("\n❌ TEST FAILED:", err.message || err);
    server.close();
    process.exit(1);
  }
}

runTests();
