import React, { useState } from "react";
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
  Image, ImageBackground,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { AnimatedButton } from "../../components/AnimatedButton";


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { login } = useAuth();
  const loginMutation = useLogin();

  const doLogin = (e: string, p: string) => {
    const normalizedEmail = e.trim().toLowerCase();
    if (!normalizedEmail || !p) { Toast.warning("Enter email and password"); return; }
    loginMutation.mutate(
      { data: { email: normalizedEmail, password: p } },
      {
        onSuccess: async (data) => {
          Toast.success("Login successful!");
          await login(data.token, data.user);
          const requiresPasswordReset = (data.user as any)?.requiresPasswordReset;
          if (requiresPasswordReset) {
            router.replace("/(auth)/reset-password" as any);
            return;
          }
          switch (data.user.role as string) {
            case "student":                 router.replace("/(student)/home" as any); break;
            case "doctor":                  router.replace("/(doctor)/queue" as any); break;
            case "pharmacist":              router.replace("/(pharmacist)/prescriptions" as any); break;
            case "lab_technician":          router.replace("/(lab)/requests" as any); break;
            case "nurse":                   router.replace("/(nurse)/lab-requests" as any); break;
            case "mental_health_counselor": router.replace("/(mental-health)/sessions" as any); break;
            case "hiv_professional":        router.replace("/(hiv-support)/sessions" as any); break;
            case "admin":                   router.replace("/(admin)/analytics" as any); break;
            default:                        router.replace("/(auth)/login" as any); break;
          }
        },
        onError: (err: any) => {
          Toast.error(err?.data?.message || err?.data?.error || err?.message || "Invalid credentials");
        },
      }
    );
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "#ffffff" }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* ── Hero ── */}
        <ImageBackground
          source={require("../../assets/images/happystudents.jpg")}
          style={[styles.hero, { paddingTop: insets.top + 40 }]}
          imageStyle={styles.heroImage}
        >
          <LinearGradient
            colors={["rgba(79, 70, 229, 0.85)", "rgba(147, 51, 234, 0.85)"]}
            style={styles.heroGradient}
          />
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
          <View style={[styles.inputWrap, { borderColor: email ? colors.primary : colors.border, backgroundColor: colors.card, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: email ? 0.2 : 0, shadowRadius: 4, elevation: email ? 4 : 0 }]}>
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
          <View style={[styles.inputWrap, { borderColor: password ? colors.primary : colors.border, backgroundColor: colors.card, shadowColor: colors.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: password ? 0.2 : 0, shadowRadius: 4, elevation: password ? 4 : 0 }]}>
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
          <AnimatedButton
            label="Sign In"
            onPress={() => doLogin(email, password)}
            isLoading={loginMutation.isPending}
            disabled={!email || !password}
            style={[styles.btn, { backgroundColor: colors.primary, shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }]}
            textStyle={styles.btnText}
          />

          <View style={styles.footer}>
            <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
              <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 14 }}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    <ToastContainer position="top" />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingBottom: 40, paddingHorizontal: 24, position: "relative" },
  heroImage: { opacity: 0.15 },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: { alignItems: "center", position: "relative", zIndex: 1 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "#fff", alignItems: "center", justifyContent: "center",
    marginBottom: 16, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  logoImage: { width: 56, height: 56 },
  heroTitle: { fontSize: 28, fontWeight: "800", color: "#ffffff", marginBottom: 6, textShadowColor: "rgba(0,0,0,0.2)", textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.9)", textAlign: "center", textShadowColor: "rgba(0,0,0,0.15)", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
  card: { paddingHorizontal: 24, paddingTop: 32 },
  cardTitle: { fontSize: 24, fontWeight: "800", marginBottom: 4, color: "#000000" },
  cardSub: { fontSize: 14, marginBottom: 24, lineHeight: 18 },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  chip: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 11, fontWeight: "600" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 52, marginBottom: 16,
  },
  input: { flex: 1, fontSize: 15 },
  btn: {
    height: 54, borderRadius: 16, justifyContent: "center", alignItems: "center", marginTop: 8, marginBottom: 24,
  },
  btnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  btnText: { color: "#ffffff", fontSize: 16, fontWeight: "700" },
  footer: { flexDirection: "row", justifyContent: "center" },
});
