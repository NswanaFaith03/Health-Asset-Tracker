import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Redirect } from "expo-router";

export default function IndexScreen() {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0f766e" />
      </View>
    );
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  // Route based on role
  switch (currentUser.role) {
    case "student":
      return <Redirect href="/(student)" />;
    case "doctor":
      return <Redirect href="/(doctor)" />;
    case "pharmacist":
      return <Redirect href="/(pharmacist)" />;
    case "lab_technician":
      return <Redirect href="/(lab)" />;
    case "mental_health_counselor":
      return <Redirect href="/(mental-health)" />;
    case "hiv_professional":
      return <Redirect href="/(hiv-support)" />;
    case "admin":
      return <Redirect href="/(admin)" />;
    default:
      return <Redirect href="/(auth)/login" />;
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