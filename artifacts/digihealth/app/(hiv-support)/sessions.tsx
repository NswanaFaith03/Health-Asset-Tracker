import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useListHivSupportSessions, useUpdateHivSupportSession, getListHivSupportSessionsQueryKey } from "@workspace/api-client-react";
import { FeatureActionGrid } from "@/components/FeatureActionGrid";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  requested: "#f59e0b", active: "#10b981", completed: "#6b7280", cancelled: "#ef4444",
};

export default function HivSessions() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: sessions, isLoading, refetch } = useListHivSupportSessions({
    query: { queryKey: getListHivSupportSessionsQueryKey() }
  });
  const updateSession = useUpdateHivSupportSession();

  const actions = [
    { label: "Resources", icon: "book-open" as any, color: "#db2777", onPress: () => router.push("/(hiv-support)/resources") },
    { label: "Refresh", icon: "refresh-cw" as any, color: colors.primary, onPress: () => refetch() },
  ];

  const handleAccept = (id: number) => {
    Alert.alert("Accept", "Accept this HIV/AIDS support session?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: () => updateSession.mutate(
          { id, data: { status: "active" } },
          { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListHivSupportSessionsQueryKey() }) }
        )
      }
    ]);
  };

  const handleComplete = (id: number) => {
    updateSession.mutate(
      { id, data: { status: "completed" } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListHivSupportSessionsQueryKey() }) }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Support Sessions</Text>
      </View>
      <FeatureActionGrid actions={actions} />
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={sessions ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: "#ef444415" }]}>
                  <Feather name="shield" size={18} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentName, { color: colors.foreground }]}>
                    {(item as any).student?.name ?? "Patient"}
                  </Text>
                  <Text style={[styles.topic, { color: colors.mutedForeground }]} numberOfLines={1}>{(item as any).topic}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>{(item as any).status}</Text>
                </View>
              </View>
              {(item as any).appointmentDate && (
                <Text style={[styles.appt, { color: colors.primary }]}>
                  Appt: {new Date((item as any).appointmentDate).toLocaleString()}
                </Text>
              )}
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date((item as any).createdAt).toLocaleDateString()}</Text>
              <View style={styles.actions}>
                {(item as any).status === "requested" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                    onPress={() => handleAccept((item as any).id)}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.primaryForeground }]}>Accept</Text>
                  </TouchableOpacity>
                )}
                {(item as any).status === "active" && (
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.muted, borderRadius: colors.radius }]}
                    onPress={() => handleComplete((item as any).id)}
                  >
                    <Text style={[styles.actionBtnText, { color: colors.foreground }]}>Complete</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="shield" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sessions</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  studentName: { fontSize: 15, fontWeight: "700" },
  topic: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  appt: { fontSize: 13, fontWeight: "600" },
  date: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  actionBtnText: { fontSize: 14, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
