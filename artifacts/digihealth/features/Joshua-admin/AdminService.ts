/**
 * @module Admin Features
 * @file AdminService.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

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

  static async resetUserPassword(id: number, newPassword: string): Promise<void> {
    await customFetch(`/api/users/${id}/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword }),
    });
  }
}
