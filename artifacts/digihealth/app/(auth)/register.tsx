import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { AnimatedButton } from "../../components/AnimatedButton";

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
      Toast.warning("Please fill in name, email, and password");
      return;
    }
    registerMutation.mutate(
      { data: { name: name.trim(), email: email.trim(), password, role: "student", ...(studentNumber ? { studentNumber } : {}) } },
      {
        onSuccess: async () => {
          Toast.success("Account created! Awaiting admin approval.");
          setTimeout(() => router.replace("/(auth)/login"), 1500);
        },
        onError: (err: any) => {
          Toast.error(err?.data?.message || err?.data?.error || err?.message || "Registration failed");
        }
      }
    );
  };

  return (
    <>
      <ImageBackground
        source={require("../../assets/images/unzaclinic.jpeg")}
        style={[styles.heroHeader, { paddingTop: insets.top + 20 }]}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay} />
        <TouchableOpacity onPress={() => router.back()} style={styles.backRow}>
          <Feather name="arrow-left" size={20} color="#111827" />
          <Text style={[styles.backText, { color: "#111827" }]}>Sign In</Text>
        </TouchableOpacity>
        <Text style={[styles.heroTitle, { color: "#000000" }]}>Create Account</Text>
        <Text style={[styles.heroSub, { color: "#6b7280" }]}>University of Zambia Health Services</Text>
      </ImageBackground>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: insets.bottom + 32, paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.foreground }]}>Only students can sign up directly. Doctors, pharmacists, lab technicians, nurses, mental health counselors, HIV support professionals, and admin accounts must be created by an existing admin.</Text>
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
      <AnimatedButton
        label="Create Account"
        onPress={handleRegister}
        isLoading={registerMutation.isPending}
        disabled={!name || !email || !password}
        style={[styles.button, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
        textColor={colors.primaryForeground}
      />

      <View style={styles.footer}>
        <Text style={{ color: colors.mutedForeground }}>Already have an account? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    <ToastContainer position="bottom" />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroHeader: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    position: "relative",
    backgroundColor: "transparent",
  },
  heroImage: { opacity: 0.35, resizeMode: "cover" },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  backRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16, zIndex: 2 },
  backText: { fontSize: 15, fontWeight: "600", color: "#111827" },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#000000", marginBottom: 4, zIndex: 2 },
  heroSub: { fontSize: 13, color: "#6b7280", zIndex: 2 },
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
