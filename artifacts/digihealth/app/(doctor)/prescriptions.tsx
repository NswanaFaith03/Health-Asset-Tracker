import React from "react";
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  ActivityIndicator, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListPrescriptions, getListPrescriptionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const STATUS: Record<string, { bg: string; text: string; label: string; icon: FeatherName }> = {
  pending:   { bg: "#fef9c3", text: "#ca8a04", label: "Pending",   icon: "clock" },
  dispensed: { bg: "#dcfce7", text: "#16a34a", label: "Dispensed", icon: "check-circle" },
  cancelled: { bg: "#fee2e2", text: "#dc2626", label: "Cancelled", icon: "x-circle" },
};

export default function DoctorPrescriptions() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const { data: prescriptions = [], isLoading, refetch } = useListPrescriptions(undefined, {
    query: { queryKey: getListPrescriptionsQueryKey() },
  });

  const mine = (prescriptions as any[]).filter(
    (p) => p.doctorId === currentUser?.id || p.doctor?.id === currentUser?.id
  );

  const pending   = mine.filter((p) => p.status === "pending").length;
  const dispensed = mine.filter((p) => p.status === "dispensed").length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Prescriptions</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Medications you have issued</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {[
            { label: "Total",     value: mine.length,  color: colors.primary },
            { label: "Pending",   value: pending,      color: "#ca8a04" },
            { label: "Dispensed", value: dispensed,    color: "#16a34a" },
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
          data={mine}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const st = STATUS[(item as any).status] ?? STATUS.pending;
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Patient & status */}
                <View style={styles.cardTop}>
                  <View style={[styles.rxIcon, { backgroundColor: colors.primary + "18" }]}>
                    <Feather name="clipboard" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.patientName, { color: colors.foreground }]}>
                      {(item as any).patient?.name ?? "Patient"}
                    </Text>
                    <Text style={[styles.medication, { color: colors.primary }]}>
                      {(item as any).medication}
                    </Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: st.bg }]}>
                    <Feather name={st.icon} size={11} color={st.text} />
                    <Text style={[styles.badgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Dosage</Text>
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>{(item as any).dosage ?? "—"}</Text>
                  </View>
                  <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.detailItem}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Date</Text>
                    <Text style={[styles.detailValue, { color: colors.foreground }]}>
                      {new Date((item as any).createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                    </Text>
                  </View>
                </View>

                {(item as any).instructions && (
                  <Text style={[styles.instructions, { color: colors.mutedForeground, borderTopColor: colors.border }]}>
                    {(item as any).instructions}
                  </Text>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                <Feather name="clipboard" size={32} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No prescriptions yet</Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                Prescriptions you issue to patients will appear here
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
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  rxIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  patientName: { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  medication: { fontSize: 14, fontWeight: "600" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  detailRow: { flexDirection: "row", borderTopWidth: 1, paddingTop: 10, marginBottom: 8 },
  detailItem: { flex: 1, alignItems: "center" },
  detailLabel: { fontSize: 11, marginBottom: 2 },
  detailValue: { fontSize: 13, fontWeight: "600" },
  detailDivider: { width: 1 },
  instructions: { fontSize: 12, lineHeight: 16, borderTopWidth: 1, paddingTop: 8 },
  empty: { paddingTop: 60, alignItems: "center", gap: 10 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 18 },
});
