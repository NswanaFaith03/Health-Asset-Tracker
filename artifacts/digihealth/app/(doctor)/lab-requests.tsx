import React from "react";
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  ActivityIndicator, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListLabRequests, getListLabRequestsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const STATUS: Record<string, { bg: string; text: string; label: string; icon: FeatherName }> = {
  pending:     { bg: "#fef9c3", text: "#ca8a04", label: "Pending",     icon: "clock" },
  in_progress: { bg: "#dbeafe", text: "#1d4ed8", label: "In Progress", icon: "loader" },
  completed:   { bg: "#dcfce7", text: "#16a34a", label: "Completed",   icon: "check-circle" },
  cancelled:   { bg: "#fee2e2", text: "#dc2626", label: "Cancelled",   icon: "x-circle" },
};

export default function DoctorLabRequests() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: requests = [], isLoading, refetch } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() },
  });

  const pending   = (requests as any[]).filter((r) => r.status === "pending").length;
  const completed = (requests as any[]).filter((r) => r.status === "completed").length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Lab Requests</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Track requested lab tests</Text>

        <View style={styles.statsRow}>
          {[
            { label: "Total",     value: (requests as any[]).length, color: colors.primary },
            { label: "Pending",   value: pending,                    color: "#ca8a04" },
            { label: "Completed", value: completed,                  color: "#16a34a" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={requests as any[]}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const st = STATUS[(item as any).status] ?? STATUS.pending;
            const hasResult = !!(item as any).result;
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <View style={[styles.labIcon, { backgroundColor: "#7c3aed18" }]}>
                    <Feather name="thermometer" size={18} color="#7c3aed" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.patientName, { color: colors.foreground }]}>
                      {(item as any).patient?.name ?? "Patient"}
                    </Text>
                    <Text style={[styles.testType, { color: "#7c3aed" }]}>
                      {(item as any).testType}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: st.bg }]}>
                    <Feather name={st.icon} size={11} color={st.text} />
                    <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>

                {(item as any).notes && (
                  <Text style={[styles.notes, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
                    {(item as any).notes}
                  </Text>
                )}

                <View style={styles.cardFooter}>
                  {hasResult && (
                    <View style={[styles.resultPill, { backgroundColor: "#dcfce7" }]}>
                      <Feather name="check-circle" size={12} color="#16a34a" />
                      <Text style={[styles.resultText, { color: "#16a34a" }]}>Results uploaded</Text>
                    </View>
                  )}
                  <Text style={[styles.date, { color: colors.mutedForeground, marginLeft: "auto" }]}>
                    {new Date((item as any).createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                <Feather name="thermometer" size={32} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No lab requests</Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                Lab tests you request for patients will appear here
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 2 },
  subtitle: { fontSize: 13, marginBottom: 14 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, marginTop: 2 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 0 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  labIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  patientName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  testType: { fontSize: 14, fontWeight: "600" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  notes: { fontSize: 13, lineHeight: 18, borderTopWidth: 1, paddingTop: 10, marginBottom: 10 },
  cardFooter: { flexDirection: "row", alignItems: "center" },
  resultPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  resultText: { fontSize: 12, fontWeight: "600" },
  date: { fontSize: 12 },
  empty: { paddingTop: 60, alignItems: "center", gap: 10 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 18 },
});
