/**
 * @module Joshua-Admin Portal
 * @file users.tsx
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

/**
 * Admin Users screen — Sprint 6 thin wrapper.
 *
 * Constants → features/Joshua-admin/constants.
 * User creation → AdminService + CreateUserModal.
 * List item → UserCard.
 * Filter tabs → FilterBar.
 */
import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useListUsers, useUpdateUserStatus, getListUsersQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { UserCard } from "../../features/Joshua-admin/components/UserCard";
import { FilterBar } from "../../features/Joshua-admin/components/FilterBar";
import { CreateUserModal } from "../../features/Joshua-admin/components/CreateUserModal";
import { AdminService } from "../../features/Joshua-admin/AdminService";
import type { UserFilter } from "../../features/Joshua-admin/constants";
import type { AppUser } from "../../features/Joshua-admin/types";

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<UserFilter>("all");

  const { data: users, isLoading, refetch } = useListUsers(undefined, {
    query: { queryKey: getListUsersQueryKey() },
  });
  const updateStatus = useUpdateUserStatus();

  const allUsers = (users ?? []) as AppUser[];
  const pendingCount = allUsers.filter((u) => u.status === "pending").length;

  const filteredUsers = allUsers.filter((u) => {
    if (filter === "pending") return u.status === "pending";
    if (filter === "student") return u.role === "student";
    if (filter === "staff")   return u.role !== "student";
    return true;
  });

  const handleStatusTap = (id: number, status: string, uname: string) => {
    if (status === "pending") {
      Toast.info(`Approving ${uname}'s account...`);
      updateStatus.mutate(
        { id, data: { status: "active" as any } },
        {
          onSuccess: () => {
            Toast.success("Account approved");
            queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          },
          onError: (err: any) => Toast.error(err?.message || "Failed to approve account"),
        }
      );
    } else {
      const next = status === "active" ? "suspended" : "active";
      Toast.info(`Setting user to ${next}...`);
      updateStatus.mutate(
        { id, data: { status: next as any } },
        {
          onSuccess: () => {
            Toast.success(`User ${next}`);
            queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
          },
          onError: (err: any) => Toast.error(err?.message || "Failed to update status"),
        }
      );
    }
  };

  const handleResetPassword = (id: number, uname: string) => {
    Alert.alert(
      "Reset Password",
      `Are you sure you want to reset the password for ${uname} to 'Reset@123'?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            Toast.info("Resetting password...");
            try {
              await AdminService.resetUserPassword(id, "Reset@123");
              Toast.success("Password reset to: Reset@123");
            } catch (err: any) {
              Toast.error(err?.message || "Failed to reset password");
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Users</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {allUsers.length} total · {pendingCount} pending
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreate(true)}
          >
            <Feather name="user-plus" size={16} color={colors.primaryForeground} />
            <Text style={[styles.createBtnText, { color: colors.primaryForeground }]}>New Staff</Text>
          </TouchableOpacity>
        </View>
 
        <FilterBar
          activeFilter={filter}
          onFilterChange={setFilter}
          pendingCount={pendingCount}
        />
 
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
            renderItem={({ item }) => (
              <UserCard
                user={item}
                onStatusTap={handleStatusTap}
                onResetPassword={handleResetPassword}
                isUpdating={updateStatus.isPending}
              />
            )}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Feather name="users" size={48} color={colors.mutedForeground} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                  {filter === "pending" ? "No pending approvals" : "No users found"}
                </Text>
              </View>
            }
          />
        )}

        <CreateUserModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() })}
        />

        <ToastContainer position="top" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 2 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { fontSize: 13, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
