import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, StatusBar, KeyboardAvoidingView, Platform, ScrollView,
  Image, ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const doLogin = (e: string, p: string) => {
    if (!e || !p) { Alert.alert("Required", "Enter email and password"); return; }
    loginMutation.mutate(
      { data: { email: e, password: p } },
      {
        onSuccess: async (data) => {
          await login(data.token, data.user);
          const requiresPasswordReset = (data.user as any)?.requiresPasswordReset;
          if (requiresPasswordReset) {
            router.replace("/(auth)/reset-password" as any);
            return;
          }
          const role = data.user.role;
          switch (role) {
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
          Alert.alert("Login Failed", err?.response?.data?.error || err?.message || "Invalid credentials");
        },
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.primary }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ── Hero ── */}
        <ImageBackground
          source={require("../../assets/images/unzaclinic.jpeg")}
          style={[styles.hero, { paddingTop: insets.top + 40 }]}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.logoCircle}>
              <Image source={require("../../assets/images/uzamainlogo.jpg")} style={styles.logoImage} resizeMode="contain" />
            </View>
            <Text style={styles.heroTitle}>UNZA DigiHealth</Text>
            <Text style={styles.heroSub}>University of Zambia Campus Clinic</Text>
          </View>
        </ImageBackground>

        {/* ── Card ── */}
        <View style={[styles.card, { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: insets.bottom + 32 }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Welcome back</Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>Sign in to access your health services</Text>

          {/* Quick-login removed for security */}

          {/* Email */}
          <Text style={[styles.label, { color: colors.foreground }]}>Email Address</Text>
          <View style={[styles.inputWrap, { borderColor: email ? colors.primary : colors.border, backgroundColor: colors.card }]}>
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

          {/* Password */}
          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <View style={[styles.inputWrap, { borderColor: password ? colors.primary : colors.border, backgroundColor: colors.card }]}>
            <Feather name="lock" size={16} color={colors.mutedForeground} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              placeholder="••••••••"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPass}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPass((v) => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Feather name={showPass ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.primary, opacity: loginMutation.isPending ? 0.75 : 1 }]}
            onPress={() => doLogin(email, password)}
            disabled={loginMutation.isPending}
            activeOpacity={0.85}
          >
            {loginMutation.isPending
              ? <ActivityIndicator color="#fff" />
              : (
                <View style={styles.btnInner}>
                  <Text style={styles.btnText}>Sign In</Text>
                  <Feather name="arrow-right" size={18} color="#fff" />
                </View>
              )
            }
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingBottom: 40, paddingHorizontal: 24, position: "relative" },
  heroImage: { opacity: 0.22 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 118, 110, 0.88)",
  },
  heroContent: { alignItems: "center", position: "relative", zIndex: 1 },
  logoCircle: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  logoImage: { width: 54, height: 54 },
  heroTitle: { fontSize: 26, fontWeight: "800", color: "#fff", marginBottom: 6 },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.75)", textAlign: "center" },
  card: { paddingHorizontal: 24, paddingTop: 32 },
  cardTitle: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  cardSub: { fontSize: 13, marginBottom: 24, lineHeight: 18 },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 11, fontWeight: "600" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 50, marginBottom: 16,
  },
  input: { flex: 1, fontSize: 15 },
  btn: {
    height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 24,
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center" },
});
