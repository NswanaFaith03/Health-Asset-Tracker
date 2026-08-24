/**
 * @module Admin Features
 * @file types.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

export type UserRole =
  | "student"
  | "doctor"
  | "pharmacist"
  | "lab_technician"
  | "nurse"
  | "mental_health_counselor"
  | "hiv_professional"
  | "admin";

export type UserStatus = "active" | "pending" | "suspended";

export type StaffRole = Exclude<UserRole, "student">;

export interface AppUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  studentNumber?: string;
}
