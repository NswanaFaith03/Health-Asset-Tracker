/**
 * @module Admin Features
 * @file index.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

/** Barrel export for the admin feature module (Sprint 6). */
export type { UserRole, UserStatus, StaffRole, AppUser } from "./types";
export { STAFF_ROLES, ROLE_COLORS, STATUS_MAP, USER_FILTERS } from "./constants";
export type { UserFilter } from "./constants";
export { AdminService } from "./AdminService";
export { UserCard } from "./components/UserCard";
export { FilterBar } from "./components/FilterBar";
export { CreateUserModal } from "./components/CreateUserModal";
