import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Redirect } from "expo-router";

export default function IndexScreen() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6b7280" />
      </View>
    );
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  // Route based on role
  switch (currentUser.role as string) {
    case "student":
      return <Redirect href={"/(student)/home" as any} />;
    case "doctor":
      return <Redirect href={"/(doctor)/queue" as any} />;
    case "pharmacist":
      return <Redirect href={"/(pharmacist)/prescriptions" as any} />;
    case "lab_technician":
      return <Redirect href={"/(lab)/requests" as any} />;
    case "nurse":
      return <Redirect href={"/(nurse)/lab-requests" as any} />;
    case "mental_health_counselor":
      return <Redirect href={"/(mental-health)/sessions" as any} />;
    case "hiv_professional":
      return <Redirect href={"/(hiv-support)/sessions" as any} />;
    case "admin":
      return <Redirect href={"/(admin)/analytics" as any} />;
    default:
      return <Redirect href={"/(auth)/login" as any} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
});