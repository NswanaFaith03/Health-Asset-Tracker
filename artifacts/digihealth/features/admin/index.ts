/** Barrel export for the admin feature module (Sprint 6). */
export type { UserRole, UserStatus, StaffRole, AppUser } from "./types";
export { STAFF_ROLES, ROLE_COLORS, STATUS_MAP, USER_FILTERS } from "./constants";
export type { UserFilter } from "./constants";
export { AdminService } from "./AdminService";
export { UserCard } from "./components/UserCard";
export { FilterBar } from "./components/FilterBar";
export { CreateUserModal } from "./components/CreateUserModal";
