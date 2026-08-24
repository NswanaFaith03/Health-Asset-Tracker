/**
 * @module Joshua-Auth Portal
 * @file forgot-password.tsx
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { customFetch } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { AnimatedButton } from "../../components/AnimatedButton";

export default function ForgotPassword() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [email, setEmail] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async () => {
    if (!email || !studentNumber || !newPassword || !confirmPassword) {
      Toast.warning("Please fill in all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Toast.warning("Passwords do not match.");
      return;
    }

    setIsPending(true);
    try {
      await customFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          studentNumber: studentNumber.trim(),
          newPassword,
        }),
      });
      
      Alert.alert(
        "Success", 
        "Your password has been reset successfully. You can now log in.", 
        [{ text: "Log In", onPress: () => router.replace("/(Joshua-auth)/login" as any) }]
      );
    } catch (err: any) {
      Alert.alert(
        "Reset Failed", 
        err?.data?.message || err?.message || "Unable to reset password. Please verify your details."
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: insets.top + 24, paddingHorizontal: 20, paddingBottom: insets.bottom + 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>

          <Text style={[styles.title, { color: colors.foreground }]}>Forgot Password</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Student self-service: Reset your password by verifying your email and student number.
          </Text>

          <View style={[styles.infoBanner, { backgroundColor: colors.muted + "44", borderColor: colors.primary }]}>
            <Feather name="info" size={16} color={colors.primary} style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={[styles.infoText, { color: colors.foreground }]}>
              Staff member? Please contact your administrator directly to request a password reset.
            </Text>
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
              <Feather name="mail" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="student@unza.zm"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Student Number</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
              <Feather name="hash" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="20241234"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
                autoCapitalize="none"
                value={studentNumber}
                onChangeText={setStudentNumber}
              />
            </View>

            <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>New Password</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
              <Feather name="lock" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="New password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Confirm Password</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
              <Feather name="lock" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Confirm new password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
                <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <AnimatedButton
              label="Reset Password"
              onPress={handleSubmit}
              isLoading={isPending}
              disabled={isPending || !email || !studentNumber || !newPassword || !confirmPassword}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              textStyle={styles.submitText}
            />

            <TouchableOpacity onPress={() => router.replace("/(Joshua-auth)/login" as any)} style={styles.loginLink}>
              <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 14 }}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <ToastContainer position="top" />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backBtn: { marginBottom: 20, alignSelf: "flex-start" },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 16, marginBottom: 8 },
  infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1.5, borderColor: "#ccc", borderRadius: 14, paddingHorizontal: 14, height: 52 },
  input: { flex: 1, fontSize: 15 },
  submitBtn: { marginTop: 28, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  submitText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  loginLink: { marginTop: 20, alignItems: "center" },
});
