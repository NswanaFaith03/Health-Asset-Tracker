import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListPrescriptions, getListPrescriptionsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", dispensed: "#10b981", cancelled: "#ef4444",
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
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={prescriptions ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <Feather name="package" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medication, { color: colors.foreground }]}>{(item as any).medication}</Text>
                  <Text style={[styles.dosage, { color: colors.mutedForeground }]}>{(item as any).dosage}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>
                    {(item as any).status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.instructions, { color: colors.foreground }]}>{(item as any).instructions}</Text>
              {(item as any).duration && (
                <Text style={[styles.duration, { color: colors.mutedForeground }]}>Duration: {(item as any).duration}</Text>
              )}
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {new Date((item as any).createdAt).toLocaleDateString()}
              </Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="package" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No prescriptions yet</Text>
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
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  medication: { fontSize: 16, fontWeight: "700" },
  dosage: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  instructions: { fontSize: 14, lineHeight: 20 },
  duration: { fontSize: 13 },
  date: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
