import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useChangePassword } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

export default function ResetPassword() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, updateCurrentUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const changePassword = useChangePassword();

  useEffect(() => {
    if (!currentUser) {
      router.replace("/(auth)/login");
    }
  }, [currentUser]);

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Required", "Please fill all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New password and confirmation must match.");
      return;
    }
    changePassword.mutate(
      { data: { currentPassword, newPassword } },
      {
        onSuccess: async () => {
          if (currentUser) {
            await updateCurrentUser({ ...(currentUser as any), requiresPasswordReset: false } as any);
          }
          Alert.alert("Success", "Your password has been updated.", [
            { text: "Continue", onPress: () => {
              switch (currentUser?.role) {
                case "student":                 router.replace("/(student)/home"); break;
                case "doctor":                  router.replace("/(doctor)/queue"); break;
                case "pharmacist":              router.replace("/(pharmacist)/prescriptions"); break;
                case "lab_technician":          router.replace("/(lab)/requests"); break;
                case "mental_health_counselor": router.replace("/(mental-health)/sessions"); break;
                case "hiv_professional":        router.replace("/(hiv-support)/sessions"); break;
                case "admin":                   router.replace("/(admin)/analytics"); break;
                default:                        router.replace("/(auth)/login"); break;
              }
            } }
          ]);
        },
        onError: (err: any) => {
          Alert.alert("Error", err?.response?.data?.message || err?.message || "Unable to change password.");
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={{ paddingTop: insets.top + 24, paddingHorizontal: 20, flex: 1 }}>
        <Text style={[styles.title, { color: colors.foreground }]}>Reset Password</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>For security, please reset your password before continuing.</Text>

        <View style={{ marginTop: 24 }}>
          <Text style={[styles.label, { color: colors.foreground }]}>Current Password</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="Current password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>New Password</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="New password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showConfirm}
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
              <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Confirm Password</Text>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
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

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: changePassword.isPending ? 0.75 : 1 }]}
            onPress={handleSubmit}
            disabled={changePassword.isPending}
          >
            <Text style={[styles.submitText, { color: "#fff" }]}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 52 },
  input: { flex: 1, fontSize: 15 },
  submitBtn: { marginTop: 28, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  submitText: { fontSize: 16, fontWeight: "700" },
});
