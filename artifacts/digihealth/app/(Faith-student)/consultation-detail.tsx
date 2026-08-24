/**
 * @module Faith-Student Portal
 * @file consultation-detail.tsx
 * @developer Faith
 * @role Senior Student Experience Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGetConsultation, getGetConsultationQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#f59e0b", under_review: "#3b82f6", assigned: "#8b5cf6", responded: "#10b981", closed: "#6b7280",
};
const SEVERITY_COLORS: Record<string, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};

export default function ConsultationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const consultationId = Number(id);

  const { data: consultation, isLoading } = useGetConsultation(consultationId, {
    query: { enabled: !!consultationId, queryKey: getGetConsultationQueryKey(consultationId) }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : !consultation ? (
        <View style={styles.center}><Text style={{ color: colors.mutedForeground }}>Not found</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(consultation as any).status] + "20" }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[(consultation as any).status] }]}>
                  {(consultation as any).status?.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[(consultation as any).severity] + "20" }]}>
                <Text style={[styles.badgeText, { color: SEVERITY_COLORS[(consultation as any).severity] }]}>
                  {(consultation as any).severity?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Symptoms</Text>
            <Text style={[styles.sectionValue, { color: colors.foreground }]}>{(consultation as any).symptoms}</Text>
            {(consultation as any).diagnosis && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Diagnosis</Text>
                <Text style={[styles.sectionValue, { color: colors.foreground }]}>{(consultation as any).diagnosis}</Text>
              </>
            )}
            {(consultation as any).notes && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Doctor Notes</Text>
                <Text style={[styles.sectionValue, { color: colors.foreground }]}>{(consultation as any).notes}</Text>
              </>
            )}
            {(consultation as any).doctor && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Attending Doctor</Text>
                <Text style={[styles.sectionValue, { color: colors.foreground }]}>{(consultation as any).doctor?.name}</Text>
              </>
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Submitted</Text>
            <Text style={[styles.sectionValue, { color: colors.foreground }]}>
              {new Date((consultation as any).createdAt).toLocaleString()}
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  row: { flexDirection: "row", gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  sectionLabel: { fontSize: 12, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 },
  sectionValue: { fontSize: 15, marginTop: 2, lineHeight: 22 },
  divider: { height: 1, marginVertical: 10 },
});
