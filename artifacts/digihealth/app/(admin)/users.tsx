import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useListUsers, useUpdateUserStatus, getListUsersQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const ROLE_COLORS: Record<string, string> = {
  student: "#3b82f6", doctor: "#10b981", pharmacist: "#8b5cf6",
  lab_technician: "#f59e0b", mental_health_counselor: "#ec4899",
  hiv_professional: "#ef4444", admin: "#6b7280",
};

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: users, isLoading, refetch } = useListUsers(undefined, {
    query: { queryKey: getListUsersQueryKey() }
  });
  const updateStatus = useUpdateUserStatus();

  const handleStatusChange = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    Alert.alert("Change Status", `Set user to ${newStatus}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Confirm",
        onPress: () => updateStatus.mutate(
          { id, data: { status: newStatus as any } },
          { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }) }
        )
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Users</Text>
        <Text style={[styles.count, { color: colors.mutedForeground }]}>{(users ?? []).length} total</Text>
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={users ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardLeft}>
                <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[(item as any).role] + "20" }]}>
                  <Text style={[styles.avatarText, { color: ROLE_COLORS[(item as any).role] }]}>
                    {(item as any).name?.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.foreground }]}>{(item as any).name}</Text>
                  <Text style={[styles.email, { color: colors.mutedForeground }]}>{(item as any).email}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[(item as any).role] + "20" }]}>
                    <Text style={[styles.roleText, { color: ROLE_COLORS[(item as any).role] }]}>
                      {(item as any).role?.replace(/_/g, " ")}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.statusBtn, {
                  backgroundColor: (item as any).status === "active" ? "#10b98115" : "#ef444415",
                  borderRadius: 8
                }]}
                onPress={() => handleStatusChange((item as any).id, (item as any).status)}
              >
                <Text style={{ fontSize: 12, fontWeight: "600", color: (item as any).status === "active" ? "#10b981" : "#ef4444" }}>
                  {(item as any).status}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No users found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  count: { fontSize: 14 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 10 },
  cardLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 18, fontWeight: "700" },
  name: { fontSize: 15, fontWeight: "700" },
  email: { fontSize: 13, marginTop: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: "flex-start", marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: "600" },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
