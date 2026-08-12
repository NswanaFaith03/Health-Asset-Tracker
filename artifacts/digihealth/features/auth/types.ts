import type { User } from "@workspace/api-client-react";

/** Narrow interface for what most screens need from AuthContext. ISP: consumers only depend on what they use. */
export interface IAuthContext {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (user: User) => Promise<void>;
}

/** Subset consumed by screens that only need to read the current user. */
export interface ICurrentUserContext {
  currentUser: User | null;
  isLoading: boolean;
}
