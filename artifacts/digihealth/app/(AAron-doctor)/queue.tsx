/**
 * @module AAron-Doctor Portal
 * @file queue.tsx
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert, StatusBar, ImageBackground,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { router } from "expo-router";
import { customFetch } from "@workspace/api-client-react";

type FeatherName = React.ComponentProps<typeof Feather>["name"];
type QueueFilter = "waiting" | "completed" | "all";

const SEVERITY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  low:      { bg: "#dcfce7", text: "#16a34a", label: "Low" },
  medium:   { bg: "#fef9c3", text: "#ca8a04", label: "Medium" },
  high:     { bg: "#ffedd5", text: "#ea580c", label: "High" },
  critical: { bg: "#fee2e2", text: "#dc2626", label: "Critical" },
};

export default function DoctorQueue() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<QueueFilter>("waiting");

  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await customFetch(`/api/queue${statusFilter === "all" ? "?status=all" : `?status=${statusFilter}`}`);
      setQueue(Array.isArray(data) ? data : []);
    } catch (error) {
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const firstName = currentUser?.name?.split(" ")[0] ?? "Doctor";
  const filteredQueue = useMemo(() => queue.filter((entry) => statusFilter === "all" || entry.status === statusFilter), [queue, statusFilter]);
  const nextPatient = filteredQueue.find((entry) => entry.status === "waiting") ?? filteredQueue[0] ?? null;
  const waitingList = filteredQueue.filter((entry) => entry.id !== nextPatient?.id);

  const handleClearCompleted = async () => {
    try {
      const result = await customFetch("/api/queue/clear-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }) as { cleared?: number; message?: string };
      await fetchQueue();
      Alert.alert("Queue updated", result?.message ?? "Completed queue entries cleared.");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to clear completed queue entries");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <ImageBackground
        source={require("../../assets/images/doctor.jpg")}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerContentCard}>
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
              <Text style={styles.summaryNum}>{filteredQueue.length}</Text>
              <Text style={styles.summaryLabel}>Visible</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNum}>{nextPatient ? `~${nextPatient.estimatedWaitMinutes ?? 10} min` : "—"}</Text>
              <Text style={styles.summaryLabel}>Next Wait</Text>
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.filterRow}>
        {(["waiting", "completed", "all"] as QueueFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterPill, { backgroundColor: statusFilter === filter ? colors.primary : colors.card, borderColor: statusFilter === filter ? colors.primary : colors.border }]}
            onPress={() => setStatusFilter(filter)}
          >
            <Text style={[styles.filterText, { color: statusFilter === filter ? colors.primaryForeground : colors.foreground }]}> 
              {filter === "all" ? "All" : filter === "waiting" ? "Waiting" : "Completed"}
            </Text>
          </TouchableOpacity>
        ))}
        {statusFilter === "completed" && (
          <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.muted }]} onPress={handleClearCompleted}>
            <Feather name="trash-2" size={15} color={colors.foreground} />
            <Text style={[styles.clearText, { color: colors.foreground }]}>Clear completed</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={waitingList}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchQueue} tintColor={colors.primary} />}
          ListHeaderComponent={
            nextPatient ? (
              <View style={{ marginBottom: 8 }}>
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
                    onPress={() => {
                      const consultationId = Number((nextPatient as any).consultation?.id);
                      if (!Number.isFinite(consultationId) || consultationId <= 0) {
                        Alert.alert("Consultation unavailable", "This queue entry does not have an active consultation.");
                        return;
                      }
                      router.push(`/(AAron-doctor)/consultation-detail?id=${consultationId}`);
                    }}
                    activeOpacity={0.85}
                  >
                    <Feather name="eye" size={18} color="#fff" />
                    <Text style={styles.callBtnText}>View Consultation</Text>
                  </TouchableOpacity>
                </View>

                {waitingList.length > 0 && (
                  <Text style={[styles.sectionLabel, { color: colors.foreground, marginTop: 8 }]}>Waiting ({waitingList.length})</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 20, position: "relative" },
  headerImage: { opacity: 1, resizeMode: "cover" },
  headerContentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerGreeting: { color: "#6b7280", fontSize: 13, marginBottom: 2 },
  headerName: { color: "#000000", fontSize: 22, fontWeight: "800" },
  onDutyBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "transparent", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  onDutyDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#4ade80" },
  onDutyText: { color: "#111827", fontSize: 12, fontWeight: "600" },
  queueSummaryRow: { flexDirection: "row", backgroundColor: "transparent", borderRadius: 12, padding: 14, gap: 16 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryNum: { color: "#111827", fontSize: 22, fontWeight: "800" },
  summaryLabel: { color: "#6b7280", fontSize: 11, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: "#e5e7eb" },
  filterRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, flexWrap: "wrap" },
  filterPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "700" },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  clearText: { fontSize: 12, fontWeight: "700" },
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
