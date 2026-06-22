import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRegister, UserRole } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { KeyboardAwareScrollViewCompat } from "../../components/KeyboardAwareScrollViewCompat";

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
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    
    registerMutation.mutate(
      { 
        data: { 
          name, 
          email, 
          password, 
          role, 
          ...(role === "student" && studentNumber ? { studentNumber } : {})
        } 
      },
      {
        onSuccess: (data) => {
          login(data.token, data.user);
          const r = data.user.role;
          switch (r) {
            case "student": router.replace("/(student)"); break;
            case "doctor": router.replace("/(doctor)"); break;
            case "pharmacist": router.replace("/(pharmacist)"); break;
            case "lab_technician": router.replace("/(lab)"); break;
            case "mental_health_counselor": router.replace("/(mental-health)"); break;
            case "hiv_professional": router.replace("/(hiv-support)"); break;
            case "admin": router.replace("/(admin)"); break;
            default: router.replace("/"); break;
          }
        },
        onError: (err: any) => {
          Alert.alert("Registration Failed", err?.message || "An error occurred");
        }
      }
    );
  };

  const roles: {label: string, value: UserRole}[] = [
    { label: "Student", value: "student" },
    { label: "Doctor", value: "doctor" },
    { label: "Pharmacist", value: "pharmacist" },
    { label: "Lab Tech", value: "lab_technician" },
    { label: "Counselor", value: "mental_health_counselor" },
    { label: "HIV Support", value: "hiv_professional" },
    { label: "Admin", value: "admin" },
  ];

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: insets.top + 40,
        paddingBottom: insets.bottom + 20,
        paddingHorizontal: 24,
      }}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Join UNZA DigiHealth</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Role</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleContainer}>
            {roles.map((r) => (
              <TouchableOpacity
                key={r.value}
                style={[
                  styles.roleChip, 
                  { 
                    backgroundColor: role === r.value ? colors.primary : colors.card,
                    borderColor: role === r.value ? colors.primary : colors.border
                  }
                ]}
                onPress={() => setRole(r.value)}
              >
                <Text style={{ 
                  color: role === r.value ? colors.primaryForeground : colors.foreground,
                  fontWeight: role === r.value ? "600" : "400"
                }}>
                  {r.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="John Doe"
            placeholderTextColor={colors.mutedForeground}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Email</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="student@unza.zm"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {role === "student" && (
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.foreground }]}>Student Number (Optional)</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="e.g. 2021000000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
              value={studentNumber}
              onChangeText={setStudentNumber}
            />
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.foreground }]}>Password</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={handleRegister}
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <ActivityIndicator color={colors.primaryForeground} />
          ) : (
            <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Register</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <Text style={{ color: colors.mutedForeground }}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={{ color: colors.primary, fontWeight: "600" }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  roleContainer: {
    flexDirection: "row",
    paddingBottom: 8,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  button: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  }
});