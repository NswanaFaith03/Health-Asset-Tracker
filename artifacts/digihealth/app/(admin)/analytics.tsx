import React from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useGetAdminAnalytics, getGetAdminAnalyticsQueryKey } from "@workspace/api-client-react";
import { FeatureActionGrid } from "@/components/FeatureActionGrid";
import { useColors } from "../../hooks/useColors";

const STAT_CARDS = [
  { key: "totalUsers", label: "Total Users", icon: "users" },
  { key: "totalConsultations", label: "Total Consults", icon: "clipboard" },
  { key: "consultationsToday", label: "Today's Consults", icon: "calendar" },
  { key: "prescriptionsIssued", label: "Prescriptions", icon: "package" },
  { key: "labTestsCompleted", label: "Lab Tests", icon: "activity" },
  { key: "counselingSessions", label: "Counseling Sessions", icon: "heart" },
];

export default function AdminAnalytics() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: analytics, isLoading, refetch } = useGetAdminAnalytics({
    query: { queryKey: getGetAdminAnalyticsQueryKey() }
  });

  const actions = [
    { label: "Users", icon: "users" as any, color: "#0d9488", onPress: () => router.push("/(admin)/users" as any) },
    { label: "Audit", icon: "list" as any, color: "#7c3aed", onPress: () => router.push("/(admin)/audit" as any) },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 84, paddingHorizontal: 16 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>
      <FeatureActionGrid actions={actions} />

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : analytics ? (
        <>
          <View style={[styles.highlight, { backgroundColor: colors.primary }]}>
            <Text style={[styles.highlightLabel, { color: colors.primaryForeground }]}>Avg Wait Time</Text>
            <Text style={[styles.highlightValue, { color: colors.primaryForeground }]}>{(analytics as any).averageWaitMinutes} min</Text>
          </View>

          <View style={styles.grid}>
            {STAT_CARDS.map(({ key, label, icon }) => (
              <View key={key} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={icon as any} size={20} color={colors.primary} />
                <Text style={[styles.cardValue, { color: colors.foreground }]}>{(analytics as any)[key] ?? 0}</Text>
                <Text style={[styles.cardLabel, { color: colors.mutedForeground }]}>{label}</Text>
              </View>
            ))}
          </View>

          {(analytics as any).usersByRole && (
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Users by Role</Text>
              {Object.entries((analytics as any).usersByRole).map(([role, count]) => (
                <View key={role} style={styles.roleRow}>
                  <Text style={[styles.roleName, { color: colors.foreground }]}>{role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Text>
                  <Text style={[styles.roleCount, { color: colors.primary }]}>{String(count)}</Text>
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  highlight: { borderRadius: 16, padding: 20, marginBottom: 16 },
  highlightLabel: { fontSize: 14, fontWeight: "500", opacity: 0.8 },
  highlightValue: { fontSize: 40, fontWeight: "800", marginTop: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  card: { width: "47%", borderRadius: 12, borderWidth: 1, padding: 16, gap: 6 },
  cardValue: { fontSize: 28, fontWeight: "700" },
  cardLabel: { fontSize: 12 },
  section: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  roleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roleName: { fontSize: 14 },
  roleCount: { fontSize: 16, fontWeight: "700" },
});
