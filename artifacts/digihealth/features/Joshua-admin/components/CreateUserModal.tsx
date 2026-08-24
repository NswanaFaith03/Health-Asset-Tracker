/**
 * @module Admin Features
 * @file CreateUserModal.tsx
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React, { useState } from "react";
import {
  View, Text, Modal, TextInput, TouchableOpacity, ScrollView, StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../../hooks/useColors";
import { AnimatedButton } from "../../../components/AnimatedButton";
import { AdminService } from "../AdminService";
import { Toast } from "../../../components/Toast";
import { STAFF_ROLES } from "../constants";
import type { StaffRole } from "../types";

interface CreateUserModalProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

/**
 * Bottom-sheet modal for creating a new staff account.
 *
 * Satisfies SRP: owns only the create-staff form UI and submission.
 * Satisfies DIP: depends on AdminService, not on customFetch directly.
 */
export function CreateUserModal({ visible, onClose, onCreated }: CreateUserModalProps) {
  const colors = useColors();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("doctor");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Toast.warning("All fields required");
      return;
    }
    setCreating(true);
    try {
      await AdminService.createStaffUser({ name, email, password, role });
      setName(""); setEmail(""); setPassword(""); setRole("doctor");
      onClose();
      onCreated();
      Toast.success("Staff account created");
    } catch (e: any) {
      Toast.error(e?.message || "Could not create user");
    } finally {
      setCreating(false);
    }
  };

  const textFields = [
    { l: "Full Name",  v: name,     s: setName,     kbt: "default" as const, cap: "words" as const,  sec: false },
    { l: "Email",      v: email,    s: setEmail,    kbt: "email-address" as const, cap: "none" as const, sec: false },
    { l: "Password",   v: password, s: setPassword, kbt: "default" as const, cap: "none" as const,  sec: true },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.background }]}>
          <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>Create Staff Account</Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={22} color={colors.foreground} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.note, { color: colors.mutedForeground }]}>
              Staff are active immediately. Students self-register and need approval.
            </Text>

            {textFields.map((f) => (
              <View key={f.l}>
                <Text style={[styles.label, { color: colors.foreground }]}>{f.l}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                  value={f.v}
                  onChangeText={f.s}
                  autoCapitalize={f.cap}
                  keyboardType={f.kbt}
                  secureTextEntry={f.sec}
                />
              </View>
            ))}

            <Text style={[styles.label, { color: colors.foreground }]}>Role</Text>
            <View style={styles.roleWrap}>
              {STAFF_ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setRole(r)}
                  style={[
                    styles.rolePill,
                    { backgroundColor: role === r ? colors.primary : colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text style={{ color: role === r ? colors.primaryForeground : colors.foreground, fontSize: 12, fontWeight: "600" }}>
                    {r.replace(/_/g, " ")}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <AnimatedButton
              label="Create Account"
              onPress={handleCreate}
              isLoading={creating}
              disabled={creating}
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              textColor={colors.primaryForeground}
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  card: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: "88%" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  title: { fontSize: 18, fontWeight: "700" },
  note: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  roleWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rolePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  submitBtn: { marginTop: 16, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
