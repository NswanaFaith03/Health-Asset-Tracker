import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useListConsultations, getListConsultationsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#f59e0b",
  under_review: "#3b82f6",
  assigned: "#8b5cf6",
  responded: "#10b981",
  closed: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  responded: "Responded",
  closed: "Closed",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "#10b981",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

export default function StudentConsultations() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: consultations, isLoading, refetch } = useListConsultations(undefined, {
    query: { queryKey: getListConsultationsQueryKey() }
  });

  const renderItem = ({ item }: { item: typeof consultations extends (infer T)[] | undefined ? T : never }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push({ pathname: "/(student)/consultation-detail", params: { id: (item as any).id } })}
    >
      <View style={styles.cardTop}>
        <View style={[styles.severityDot, { backgroundColor: SEVERITY_COLORS[(item as any).severity] || "#6b7280" }]} />
        <Text style={[styles.symptoms, { color: colors.foreground }]} numberOfLines={2}>
          {(item as any).symptoms}
        </Text>
      </View>
      <View style={styles.cardBottom}>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
          <Text style={[styles.statusText, { color: STATUS_COLORS[(item as any).status] || "#6b7280" }]}>
            {STATUS_LABELS[(item as any).status] || (item as any).status}
          </Text>
        </View>
        <Text style={[styles.date, { color: colors.mutedForeground }]}>
          {new Date((item as any).createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Consultations</Text>
        <TouchableOpacity
          style={[styles.newBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={() => router.push("/(student)/new-consultation")}
        >
          <Feather name="plus" size={20} color={colors.primaryForeground} />
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={consultations ?? []}
          keyExtractor={(item) => String((item as any).id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="clipboard" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No consultations yet</Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                onPress={() => router.push("/(student)/new-consultation")}
              >
                <Text style={{ color: colors.primaryForeground, fontWeight: "600" }}>Request Consultation</Text>
              </TouchableOpacity>
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
  newBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  symptoms: { flex: 1, fontSize: 15, fontWeight: "500" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "600" },
  date: { fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, marginTop: 8 },
  emptyBtn: { paddingHorizontal: 20, paddingVertical: 12, marginTop: 8 },
});
