import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");

  const insets = useSafeAreaInsets();
  const colors = useColors();
  const registerMutation = useRegister();

  const handleRegister = () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Required Fields", "Please fill in name, email, and password.");
      return;
    }
    registerMutation.mutate(
      { data: { name: name.trim(), email: email.trim(), password, role: "student", ...(studentNumber ? { studentNumber } : {}) } },
      {
        onSuccess: async () => {
          Alert.alert(
            "Account Pending Approval",
            "Your student account has been created and is pending admin approval. Please sign in after your account is approved.",
            [{ text: "OK", onPress: () => router.replace("/(auth)/login") }]
          );
        },
        onError: (err: any) => {
          Alert.alert("Registration Failed", err?.response?.data?.message || err?.response?.data?.error || err?.message || "An error occurred");
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
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Student accounts register here. Staff accounts are created by an admin.</Text>

      <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Feather name="info" size={16} color={colors.primary} />
        <Text style={[styles.noticeText, { color: colors.foreground }]}>Only students can sign up directly. Doctors, pharmacists, lab, mental health, HIV support, and admin accounts must be created by an existing admin.</Text>
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

      <Text style={[styles.label, { color: colors.foreground }]}>Student Number <Text style={{ color: colors.mutedForeground }}>(optional)</Text></Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
        placeholder="e.g. 2021000000"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="number-pad"
        value={studentNumber}
        onChangeText={setStudentNumber}
      />

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
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 18 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 17 },
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
