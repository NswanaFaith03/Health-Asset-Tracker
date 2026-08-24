/**
 * @module Admin Features
 * @file UserCard.tsx
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AnimatedButton } from "../../../components/AnimatedButton";
import { useColors } from "../../../hooks/useColors";
import { ROLE_COLORS, STATUS_MAP } from "../constants";
import type { AppUser } from "../types";

interface UserCardProps {
  user: AppUser;
  onStatusTap: (id: number, status: string, name: string) => void;
  onResetPassword?: (id: number, name: string) => void;
  isUpdating: boolean;
}

/**
 * Single user row card for the Admin Users list.
 *
 * Satisfies SRP: owns only user card presentation.
 * Satisfies OCP: role/status colors extend via constant maps, not by editing this component.
 */
export function UserCard({ user, onStatusTap, onResetPassword, isUpdating }: UserCardProps) {
  const colors = useColors();
  const sc = STATUS_MAP[user.status] ?? STATUS_MAP.active;
  const isPending = user.status === "pending";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isPending ? "#f59e0b60" : colors.border,
          borderWidth: isPending ? 1.5 : 1,
        },
      ]}
    >
      {isPending && (
        <View style={styles.pendingBanner}>
          <Feather name="clock" size={11} color="#f59e0b" />
          <Text style={styles.pendingText}>Awaiting admin approval</Text>
        </View>
      )}
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[user.role] + "20" }]}>
          <Text style={[styles.avatarText, { color: ROLE_COLORS[user.role] }]}>
            {user.name?.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.uname, { color: colors.foreground }]}>{user.name}</Text>
          <Text style={[styles.uemail, { color: colors.mutedForeground }]}>{user.email}</Text>
          {user.studentNumber && (
            <Text style={[styles.ustnum, { color: colors.mutedForeground }]}>#{user.studentNumber}</Text>
          )}
          <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[user.role] + "20" }]}>
            <Text style={[styles.roleText, { color: ROLE_COLORS[user.role] }]}>
              {user.role.replace(/_/g, " ")}
            </Text>
          </View>
        </View>
        {user.status !== "pending" && onResetPassword && (
          <TouchableOpacity
            style={[styles.resetBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => onResetPassword(user.id, user.name)}
          >
            <Feather name="key" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
        <AnimatedButton
          label={sc.label}
          onPress={() => onStatusTap(user.id, user.status, user.name)}
          isLoading={isUpdating}
          style={[styles.statusBtn, { backgroundColor: sc.bg }]}
          textColor={sc.fg}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  pendingBanner: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#f59e0b15",
  },
  pendingText: { fontSize: 12, fontWeight: "600", color: "#f59e0b" },
  row: { flexDirection: "row", alignItems: "center", padding: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: "700" },
  uname: { fontSize: 15, fontWeight: "700" },
  uemail: { fontSize: 12, marginTop: 1 },
  ustnum: { fontSize: 11, marginTop: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: "flex-start", marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: "600" },
  resetBtn: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center", marginRight: 8 },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignItems: "center", minWidth: 80 },
});
