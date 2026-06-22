import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

const ROLE_LABELS: Record<string, string> = {
  student: "Student", doctor: "Doctor", pharmacist: "Pharmacist",
  lab_technician: "Lab Technician", mental_health_counselor: "Counselor",
  hiv_professional: "HIV Professional", admin: "Administrator",
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 84, paddingHorizontal: 16 }}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <View style={[styles.avatarSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {currentUser?.name?.charAt(0).toUpperCase() ?? "U"}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{currentUser?.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + "20" }]}>
          <Text style={[styles.roleText, { color: colors.primary }]}>
            {ROLE_LABELS[currentUser?.role ?? "student"] ?? currentUser?.role}
          </Text>
        </View>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{currentUser?.email}</Text>
      </View>

      {currentUser?.studentNumber && (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="hash" size={18} color={colors.primary} />
          <View>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Student Number</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{currentUser.studentNumber}</Text>
          </View>
        </View>
      )}

      {currentUser?.phone && (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="phone" size={18} color={colors.primary} />
          <View>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{currentUser.phone}</Text>
          </View>
        </View>
      )}

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="shield" size={18} color={colors.primary} />
        <View>
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Account Status</Text>
          <Text style={[styles.infoValue, { color: "#10b981" }]}>Active</Text>
        </View>
      </View>

      <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.aboutTitle, { color: colors.foreground }]}>About UNZA DigiHealth</Text>
        <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
          A digital healthcare platform for the University of Zambia campus clinic. Connect with doctors, access prescriptions, lab results, mental health support, and HIV/AIDS resources — all in one place.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: "#ef4444", borderRadius: colors.radius }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={18} color="#ef4444" />
        <Text style={[styles.logoutText, { color: "#ef4444" }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  avatarSection: { borderRadius: 12, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  avatarText: { fontSize: 32, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700" },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 13, fontWeight: "600" },
  email: { fontSize: 14 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 10 },
  infoLabel: { fontSize: 12, fontWeight: "500" },
  infoValue: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  aboutCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, gap: 8 },
  aboutTitle: { fontSize: 16, fontWeight: "700" },
  aboutText: { fontSize: 14, lineHeight: 20 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderWidth: 1 },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
