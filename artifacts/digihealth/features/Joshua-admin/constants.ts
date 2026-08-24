/**
 * @module Admin Features
 * @file constants.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import type { UserRole, UserStatus, StaffRole } from "./types";

export const STAFF_ROLES: StaffRole[] = [
  "doctor", "pharmacist", "lab_technician", "nurse",
  "mental_health_counselor", "hiv_professional", "admin",
];

export const ROLE_COLORS: Record<UserRole, string> = {
  student:               "#3b82f6",
  doctor:                "#10b981",
  pharmacist:            "#8b5cf6",
  lab_technician:        "#f59e0b",
  nurse:                 "#06b6d4",
  mental_health_counselor: "#ec4899",
  hiv_professional:      "#ef4444",
  admin:                 "#6b7280",
};

export const STATUS_MAP: Record<UserStatus, { bg: string; fg: string; label: string }> = {
  active:    { bg: "#10b98115", fg: "#10b981", label: "Active" },
  pending:   { bg: "#f59e0b15", fg: "#f59e0b", label: "Pending ▸ Approve" },
  suspended: { bg: "#ef444415", fg: "#ef4444", label: "Suspended" },
};

export const USER_FILTERS = [
  { k: "all",     l: "All" },
  { k: "pending", l: "Pending" },
  { k: "student", l: "Students" },
  { k: "staff",   l: "Staff" },
] as const;

export type UserFilter = (typeof USER_FILTERS)[number]["k"];
