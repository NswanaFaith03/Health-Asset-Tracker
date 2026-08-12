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
