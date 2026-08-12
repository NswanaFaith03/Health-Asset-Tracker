import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useListPrescriptions, getListPrescriptionsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", dispensed: "#10b981", cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending", dispensed: "Dispensed", cancelled: "Cancelled",
};

export default function StudentPrescriptions() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: prescriptions, isLoading, refetch } = useListPrescriptions(undefined, {
    query: { queryKey: getListPrescriptionsQueryKey() }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Prescriptions</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Your medication history
        </Text>
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={prescriptions ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => {
            const rx = item as any;
            const consultationId = rx.consultationId;
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Header row: icon + medication + status badge */}
                <View style={styles.cardTop}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
                    <Feather name="clipboard" size={18} color={colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.medication, { color: colors.foreground }]}>{rx.medication}</Text>
                    <Text style={[styles.dosage, { color: colors.mutedForeground }]}>{rx.dosage}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: (STATUS_COLORS[rx.status] ?? "#888") + "20" }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLORS[rx.status] ?? "#888" }]}>
                      {STATUS_LABELS[rx.status] ?? rx.status}
                    </Text>
                  </View>
                </View>

                {/* Instructions */}
                {rx.instructions ? (
                  <View style={styles.infoRow}>
                    <Feather name="info" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.instructions, { color: colors.foreground }]}>{rx.instructions}</Text>
                  </View>
                ) : null}

                {/* Duration */}
                {rx.duration ? (
                  <View style={styles.infoRow}>
                    <Feather name="clock" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Duration: {rx.duration}</Text>
                  </View>
                ) : null}

                {/* Issuing doctor */}
                {rx.doctor?.name ? (
                  <View style={styles.infoRow}>
                    <Feather name="user" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Prescribed by Dr. {rx.doctor.name}</Text>
                  </View>
                ) : null}

                {/* Dispensing notes */}
                {rx.dispensingNotes ? (
                  <View style={styles.infoRow}>
                    <Feather name="message-square" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.metaText, { color: colors.mutedForeground }]}>Pharmacy note: {rx.dispensingNotes}</Text>
                  </View>
                ) : null}

                {/* Linked consultation */}
                {consultationId ? (
                  <TouchableOpacity
                    style={[styles.consultationLink, { borderColor: colors.primary + "40", backgroundColor: colors.primary + "08" }]}
                    onPress={() => router.push({ pathname: "/(student)/consultation-detail", params: { id: String(consultationId) } })}
                    activeOpacity={0.7}
                  >
                    <Feather name="activity" size={13} color={colors.primary} />
                    <Text style={[styles.consultationLinkText, { color: colors.primary }]}>
                      View linked consultation #{consultationId}
                    </Text>
                    <Feather name="chevron-right" size={13} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}

                {/* Date */}
                <Text style={[styles.date, { color: colors.mutedForeground }]}>
                  Issued {new Date(rx.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="clipboard" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No prescriptions yet</Text>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
                Prescriptions issued by your doctor will appear here.
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
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 13, marginTop: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  medication: { fontSize: 16, fontWeight: "700" },
  dosage: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  instructions: { fontSize: 14, lineHeight: 20, flex: 1 },
  metaText: { fontSize: 13, flex: 1 },
  consultationLink: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8,
  },
  consultationLinkText: { fontSize: 13, fontWeight: "600", flex: 1 },
  date: { fontSize: 11, marginTop: 2 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
});
