import { customFetch } from "@workspace/api-client-react";
import type { StaffRole } from "./types";

interface CreateStaffUserPayload {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

/**
 * Admin service for user management operations.
 *
 * Satisfies SRP: owns only admin API calls.
 * Satisfies DIP: callers depend on this service, not on customFetch directly.
 */
export class AdminService {
  static async createStaffUser(payload: CreateStaffUserPayload): Promise<void> {
    await customFetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim(),
        password: payload.password,
        role: payload.role,
      }),
    });
  }
}
