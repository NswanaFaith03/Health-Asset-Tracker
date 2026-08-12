import { spawn } from "child_process";
import fs from "fs";
import path from "path";

// Get the workspace root relative to this file: scripts/src/verify-fixes.ts -> scripts -> root
const workspaceRoot = path.resolve(import.meta.dirname, "../..");

// 1. Read environment variables from .env.local in the workspace root
const envPath = path.resolve(workspaceRoot, ".env.local");
let envData = "";
try {
  envData = fs.readFileSync(envPath, "utf-8");
} catch (e) {
  console.error("Could not find .env.local, checking process.env...");
}

const env: Record<string, string> = { ...process.env };
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
  env[key] = val;
});

const PORT = "5555";
env["PORT"] = PORT;

console.log("🚀 Starting verification server on port", PORT, "...");
console.log("   Root path:", workspaceRoot);

const serverProcess = spawn("node", [path.resolve(workspaceRoot, "artifacts/api-server/dist/index.mjs")], {
  env,
  stdio: "inherit",
});

// Helper to kill server and exit
function shutdown(exitCode: number) {
  console.log("🛑 Shutting down verification server...");
  serverProcess.kill();
  process.exit(exitCode);
}

// Handle unexpected failures
serverProcess.on("error", (err) => {
  console.error("❌ Failed to start server process:", err);
  process.exit(1);
});

// Wait for server to boot, then run tests
setTimeout(async () => {
  try {
    console.log("\n🧪 Running integration tests...");

    const baseUrl = `http://localhost:${PORT}/api`;
    const randomEmail = `verify-student-${Date.now()}@unza.zm`;
    const password = "Password123";

    // TEST 1: Register student (should be created with "pending" status)
    console.log("\n[Test 1] Registering a new student account...");
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
      throw new Error(`Failed to register student. Status: ${regRes.status}, Body: ${text}`);
    }

    const regData = await regRes.json() as any;
    console.log("  ↳ Registration Success! Returned user status:", regData.status);
    if (regData.status !== "pending") {
      throw new Error(`Expected registered student status to be 'pending', but got '${regData.status}'`);
    }

    // TEST 2: Attempt login as pending student (should return 401 with custom message)
    console.log("\n[Test 2] Attempting to log in as the pending student...");
    const loginPendingRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: randomEmail,
        password,
      }),
    });

    console.log("  ↳ Login Response HTTP Status:", loginPendingRes.status);
    const loginPendingData = await loginPendingRes.json() as any;
    console.log("  ↳ Login Response Body:", JSON.stringify(loginPendingData));

    if (loginPendingRes.status !== 401) {
      throw new Error(`Expected login status to be 401 for pending user, but got ${loginPendingRes.status}`);
    }
    if (loginPendingData.error !== "pending") {
      throw new Error(`Expected response error property to be 'pending', but got '${loginPendingData.error}'`);
    }
    if (!loginPendingData.message.includes("awaiting admin approval")) {
      throw new Error(`Expected message to mention 'awaiting admin approval', but got '${loginPendingData.message}'`);
    }

    // TEST 3: Admin login (to approve student and check status routes)
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
      const text = await adminLoginRes.text();
      throw new Error(`Admin login failed. Status: ${adminLoginRes.status}, Body: ${text}`);
    }
    const adminLoginData = await adminLoginRes.json() as any;
    const adminToken = adminLoginData.token;
    console.log("  ↳ Admin logged in successfully!");

    // TEST 4: Approve the pending student account
    console.log("\n[Test 4] Admin approving the pending student...");
    const studentId = regData.id;
    const approveRes = await fetch(`${baseUrl}/users/${studentId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "active" }),
    });

    if (approveRes.status !== 200) {
      const text = await approveRes.text();
      throw new Error(`Admin approval failed. Status: ${approveRes.status}, Body: ${text}`);
    }
    const approveData = await approveRes.json() as any;
    console.log("  ↳ Student status updated. New status:", approveData.status);
    if (approveData.status !== "active") {
      throw new Error(`Expected student status to become 'active', but got '${approveData.status}'`);
    }

    // TEST 5: Log in as now active student
    console.log("\n[Test 5] Logging in as the newly approved student...");
    const studentLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: randomEmail,
        password,
      }),
    });

    if (studentLoginRes.status !== 200) {
      const text = await studentLoginRes.text();
      throw new Error(`Student login failed post-approval. Status: ${studentLoginRes.status}, Body: ${text}`);
    }
    const studentLoginData = await studentLoginRes.json() as any;
    const studentToken = studentLoginData.token;
    console.log("  ↳ Student logged in successfully!");

    // TEST 6: Upload student profile photo (avatar) as base64
    console.log("\n[Test 6] Uploading student avatar as base64...");
    const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="; // 1x1 png pixel
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
      const text = await avatarRes.text();
      throw new Error(`Avatar upload failed. Status: ${avatarRes.status}, Body: ${text}`);
    }
    const avatarData = await avatarRes.json() as any;
    console.log("  ↳ Avatar Upload Response Status:", avatarRes.status);
    console.log("  ↳ Returned avatar url starts with:", avatarData.url.substring(0, 50) + "...");
    if (!avatarData.url.startsWith("data:image/png;base64,")) {
      throw new Error(`Expected avatar url to start with 'data:image/png;base64,', but got '${avatarData.url}'`);
    }
    if (avatarData.user.avatarUrl !== avatarData.url) {
      throw new Error(`Expected user.avatarUrl to match the returned url, but got user.avatarUrl='${avatarData.user.avatarUrl}'`);
    }

    console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! ✅");
    shutdown(0);
  } catch (err: any) {
    console.error("\n❌ VERIFICATION TEST FAILED:", err.message || err);
    shutdown(1);
  }
}, 2000);
