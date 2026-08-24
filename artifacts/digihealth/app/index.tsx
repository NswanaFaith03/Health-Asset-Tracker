/**
 * @module Core App Entry
 * @file index.tsx
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Redirect } from "expo-router";

export default function IndexScreen() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!currentUser) {
    return <Redirect href="/(Joshua-auth)/login" />;
  }

  // Route based on role
  switch (currentUser.role as string) {
    case "student":
      return <Redirect href={"/(Faith-student)/home" as any} />;
    case "doctor":
      return <Redirect href={"/(AAron-doctor)/queue" as any} />;
    case "pharmacist":
      return <Redirect href={"/(Khadijah-Joshua-pharmacist)/prescriptions" as any} />;
    case "lab_technician":
      return <Redirect href={"/(Khadijah-lab)/requests" as any} />;
    case "nurse":
      return <Redirect href={"/(AAron-nurse)/lab-requests" as any} />;
    case "mental_health_counselor":
      return <Redirect href={"/(Faith-moses-mental-health)/sessions" as any} />;
    case "hiv_professional":
      return <Redirect href={"/(moses-hiv-support)/sessions" as any} />;
    case "admin":
      return <Redirect href={"/(Joshua-admin)/analytics" as any} />;
    default:
      return <Redirect href={"/(Joshua-auth)/login" as any} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
});