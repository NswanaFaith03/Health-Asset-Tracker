import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListPrescriptions, getListPrescriptionsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

export default function PharmacistHistory() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: prescriptions, isLoading, refetch } = useListPrescriptions({ status: "dispensed" }, {
    query: { queryKey: getListPrescriptionsQueryKey({ status: "dispensed" }) }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Dispensed History</Text>
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
                <View style={[styles.checkCircle, { backgroundColor: "#10b98115" }]}>
                  <Feather name="check-circle" size={18} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.patient, { color: colors.foreground }]}>{(item as any).patient?.name ?? "Patient"}</Text>
                  <Text style={[styles.medication, { color: colors.primary }]}>{(item as any).medication}</Text>
                  <Text style={[styles.dosage, { color: colors.mutedForeground }]}>{(item as any).dosage}</Text>
                </View>
              </View>
              {(item as any).dispensedAt && (
                <Text style={[styles.dispensedAt, { color: colors.mutedForeground }]}>
                  Dispensed: {new Date((item as any).dispensedAt).toLocaleString()}
                </Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="clock" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No history yet</Text>
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
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  checkCircle: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  patient: { fontSize: 15, fontWeight: "700" },
  medication: { fontSize: 15, fontWeight: "600" },
  dosage: { fontSize: 13, marginTop: 2 },
  dispensedAt: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
