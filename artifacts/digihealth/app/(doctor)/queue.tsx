import React from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useGetQueue, useCompleteQueueEntry, getGetQueueQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low:      { bg: "#dcfce7", text: "#16a34a", label: "Low" },
  medium:   { bg: "#fef9c3", text: "#ca8a04", label: "Medium" },
  high:     { bg: "#ffedd5", text: "#ea580c", label: "High" },
  critical: { bg: "#fee2e2", text: "#dc2626", label: "Critical" },
};

export default function DoctorQueue() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { data: queue = [], isLoading, refetch } = useGetQueue({ query: { queryKey: getGetQueueQueryKey() } });
  const completeEntry = useCompleteQueueEntry();

  const firstName = currentUser?.name?.split(" ")[0] ?? "Doctor";
  const nextPatient = (queue as any[])[0];
  const waitingList = (queue as any[]).slice(1);

  const handleComplete = (id: number, name: string) => {
    Alert.alert(
      "Complete Visit",
      `Mark ${name}'s visit as complete?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Complete",
          style: "default",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            completeEntry.mutate({ id }, {
              onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey() }),
            });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: insets.top + 20 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerGreeting}>Welcome back</Text>
            <Text style={styles.headerName}>Dr. {firstName}</Text>
          </View>
          <View style={styles.onDutyBadge}>
            <View style={styles.onDutyDot} />
            <Text style={styles.onDutyText}>On Duty</Text>
          </View>
        </View>
        <View style={styles.queueSummaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{(queue as any[]).length}</Text>
            <Text style={styles.summaryLabel}>In Queue</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{nextPatient ? `~${(nextPatient as any).estimatedWaitMinutes ?? 10} min` : "—"}</Text>
            <Text style={styles.summaryLabel}>Next Wait</Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={waitingList}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
          ListHeaderComponent={
            nextPatient ? (
              <View style={{ marginBottom: 8 }}>
                {/* Next patient hero */}
                <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Next Patient</Text>
                <View style={[styles.nextCard, { backgroundColor: colors.card, borderColor: colors.primary }]}>
                  <View style={styles.nextCardTop}>
                    <View style={[styles.queueBubble, { backgroundColor: colors.primary }]}>
                      <Text style={styles.queueBubbleText}>#{(nextPatient as any).queueNumber}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.nextPatientName, { color: colors.foreground }]}>
                        {(nextPatient as any).student?.name ?? "Patient"}
                      </Text>
                      <Text style={[styles.nextSymptoms, { color: colors.mutedForeground }]} numberOfLines={2}>
                        {(nextPatient as any).consultation?.symptoms ?? "No symptoms noted"}
                      </Text>
                    </View>
                    {(() => {
                      const sev = (nextPatient as any).consultation?.severity;
                      const s = SEVERITY_COLORS[sev];
                      return s ? (
                        <View style={[styles.sevBadge, { backgroundColor: s.bg }]}>
                          <Text style={[styles.sevText, { color: s.text }]}>{s.label}</Text>
                        </View>
                      ) : null;
                    })()}
                  </View>
                  <TouchableOpacity
                    style={[styles.callBtn, { backgroundColor: colors.primary }]}
                    onPress={() => handleComplete((nextPatient as any).id, (nextPatient as any).student?.name ?? "Patient")}
                    activeOpacity={0.85}
                  >
                    <Feather name="check-circle" size={18} color="#fff" />
                    <Text style={styles.callBtnText}>Complete Visit</Text>
                  </TouchableOpacity>
                </View>

                {waitingList.length > 0 && (
                  <Text style={[styles.sectionLabel, { color: colors.foreground, marginTop: 8 }]}>
                    Waiting ({waitingList.length})
                  </Text>
                )}
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const sev = (item as any).consultation?.severity;
            const s = SEVERITY_COLORS[sev];
            return (
              <View style={[styles.waitCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.waitNum, { backgroundColor: colors.muted }]}>
                  <Text style={[styles.waitNumText, { color: colors.foreground }]}>
                    #{(item as any).queueNumber}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.waitName, { color: colors.foreground }]}>
                    {(item as any).student?.name ?? "Patient"}
                  </Text>
                  <Text style={[styles.waitSymptoms, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {(item as any).consultation?.symptoms ?? "—"}
                  </Text>
                </View>
                {s && (
                  <View style={[styles.sevBadge, { backgroundColor: s.bg }]}>
                    <Text style={[styles.sevText, { color: s.text }]}>{s.label}</Text>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            !nextPatient ? (
              <View style={styles.empty}>
                <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                  <Feather name="users" size={36} color={colors.mutedForeground} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Queue is clear</Text>
                <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>No patients waiting right now</Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerGreeting: { color: "rgba(255,255,255,0.72)", fontSize: 13, marginBottom: 2 },
  headerName: { color: "#fff", fontSize: 22, fontWeight: "800" },
  onDutyBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  onDutyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4ade80" },
  onDutyText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  queueSummaryRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 12, padding: 14, gap: 16 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { color: "#fff", fontSize: 22, fontWeight: "800" },
  summaryLabel: { color: "rgba(255,255,255,0.75)", fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  sectionLabel: { fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10, marginTop: 16 },
  nextCard: { borderRadius: 16, borderWidth: 2, padding: 16, gap: 14 },
  nextCardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  queueBubble: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  queueBubbleText: { color: "#fff", fontSize: 14, fontWeight: "800" },
  nextPatientName: { fontSize: 17, fontWeight: "800", marginBottom: 4 },
  nextSymptoms: { fontSize: 13, lineHeight: 18 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sevText: { fontSize: 11, fontWeight: "700" },
  callBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 13 },
  callBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  waitCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  waitNum: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  waitNumText: { fontSize: 12, fontWeight: "700" },
  waitName: { fontSize: 14, fontWeight: "700" },
  waitSymptoms: { fontSize: 12, marginTop: 2 },
  empty: { paddingTop: 60, alignItems: "center", gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptyDesc: { fontSize: 14, textAlign: "center" },
});
