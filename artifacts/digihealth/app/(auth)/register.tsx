import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRegister, UserRole } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

const ROLES: { value: UserRole; label: string; icon: any; desc: string }[] = [
  { value: "student",               label: "Student",       icon: "book-open",  desc: "Access consultations & health services" },
  { value: "doctor",                label: "Doctor",        icon: "activity",   desc: "Manage patient queue & consultations" },
  { value: "pharmacist",            label: "Pharmacist",    icon: "package",    desc: "Dispense & manage prescriptions" },
  { value: "lab_technician",        label: "Lab Tech",      icon: "thermometer",desc: "Process lab requests & upload results" },
  { value: "mental_health_counselor", label: "Counselor",   icon: "heart",      desc: "Provide mental health support" },
  { value: "hiv_professional",      label: "HIV Support",   icon: "shield",     desc: "HIV/AIDS sessions & resources" },
  { value: "admin",                 label: "Admin",         icon: "settings",   desc: "System management & analytics" },
];

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");

  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { login } = useAuth();
  const registerMutation = useRegister();

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Required Fields", "Please fill in name, email, and password.");
      return;
    }
    registerMutation.mutate(
      { data: { name: name.trim(), email: email.trim(), password, role, ...(role === "student" && studentNumber ? { studentNumber } : {}) } },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          const r = data.user.role;
          switch (r) {
            case "student":                 router.replace("/(student)/home"); break;
            case "doctor":                  router.replace("/(doctor)/queue"); break;
            case "pharmacist":              router.replace("/(pharmacist)/prescriptions"); break;
            case "lab_technician":          router.replace("/(lab)/requests"); break;
            case "mental_health_counselor": router.replace("/(mental-health)/sessions"); break;
            case "hiv_professional":        router.replace("/(hiv-support)/sessions"); break;
            case "admin":                   router.replace("/(admin)/analytics"); break;
            default:                        router.replace("/(auth)/login"); break;
          }
        },
        onError: (err: any) => {
          Alert.alert("Registration Failed", err?.response?.data?.error || err?.message || "An error occurred");
        }
      }
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32, paddingHorizontal: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
        <Feather name="arrow-left" size={20} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}>Sign In</Text>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Join UNZA DigiHealth — select your role below</Text>

      {/* ── Role Picker ── */}
      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Your Role</Text>
      <View style={styles.roleGrid}>
        {ROLES.map((r) => {
          const active = role === r.value;
          return (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.roleCard,
                {
                  backgroundColor: active ? colors.primary : colors.card,
                  borderColor: active ? colors.primary : colors.border,
                }
              ]}
              onPress={() => setRole(r.value)}
              activeOpacity={0.8}
            >
              <Feather name={r.icon} size={22} color={active ? colors.primaryForeground : colors.primary} />
              <Text style={[styles.roleLabel, { color: active ? colors.primaryForeground : colors.foreground }]}>{r.label}</Text>
              <Text style={[styles.roleDesc, { color: active ? colors.primaryForeground + "cc" : colors.mutedForeground }]} numberOfLines={2}>
                {r.desc}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Fields ── */}
      <Text style={[styles.sectionLabel, { color: colors.foreground, marginTop: 8 }]}>Your Details</Text>

      <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
        placeholder="e.g. Alice Banda"
        placeholderTextColor={colors.mutedForeground}
        value={name}
        onChangeText={setName}
      />

      <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
        placeholder="student@unza.zm"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {role === "student" && (
        <>
          <Text style={[styles.label, { color: colors.foreground }]}>Student Number <Text style={{ color: colors.mutedForeground }}>(optional)</Text></Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. 2021000000"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="number-pad"
            value={studentNumber}
            onChangeText={setStudentNumber}
          />
        </>
      )}

      <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
        placeholder="At least 8 characters"
        placeholderTextColor={colors.mutedForeground}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* ── Submit ── */}
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: registerMutation.isPending ? 0.7 : 1 }]}
        onPress={handleRegister}
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending
          ? <ActivityIndicator color={colors.primaryForeground} />
          : <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Create Account</Text>
        }
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={{ color: colors.mutedForeground }}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 20 },
  backText: { fontSize: 15, fontWeight: "600" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24, lineHeight: 20 },
  sectionLabel: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 },
  roleGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  roleCard: {
    width: "47%", borderWidth: 1.5, borderRadius: 12,
    padding: 14, gap: 6, alignItems: "flex-start",
  },
  roleLabel: { fontSize: 14, fontWeight: "700" },
  roleDesc: { fontSize: 11, lineHeight: 15 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: {
    height: 48, borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, fontSize: 15, marginBottom: 14,
  },
  button: {
    height: 52, justifyContent: "center", alignItems: "center", marginTop: 4,
  },
  buttonText: { fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
});
