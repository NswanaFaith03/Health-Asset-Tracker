import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useListConsultations, getListConsultationsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#f59e0b", under_review: "#3b82f6", assigned: "#8b5cf6", responded: "#10b981", closed: "#6b7280",
};
const SEVERITY_COLORS: Record<string, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};

export default function DoctorConsultations() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: consultations, isLoading, refetch } = useListConsultations(undefined, {
    query: { queryKey: getListConsultationsQueryKey() }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Consultations</Text>
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={consultations ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: "/(doctor)/consultation-detail", params: { id: (item as any).id } })}
            >
              <View style={styles.cardTop}>
                <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[(item as any).severity] }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.patientName, { color: colors.foreground }]}>{(item as any).student?.name ?? "Patient"}</Text>
                  <Text style={[styles.symptoms, { color: colors.mutedForeground }]} numberOfLines={2}>{(item as any).symptoms}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>
                    {(item as any).status?.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {new Date((item as any).createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="clipboard" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No consultations</Text>
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
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  patientName: { fontSize: 15, fontWeight: "700" },
  symptoms: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
