/**
 * @module Auth Features
 * @file useAuthGuard.ts
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { useEffect } from "react";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Routes } from "../../constants/routes";

/**
 * Redirect unauthenticated users to the login screen.
 *
 * Satisfies SRP: owns only the auth-guard side-effect, nothing else.
 *
 * Usage: call at the top of any protected screen.
 *   useAuthGuard();
 */
export function useAuthGuard() {
  const { currentUser, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace(Routes.auth.login);
    }
  }, [currentUser, isLoading]);

  return { currentUser, isLoading };
}
