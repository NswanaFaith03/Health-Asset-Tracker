import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListPrescriptions, getListPrescriptionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", dispensed: "#10b981", cancelled: "#ef4444",
};

export default function DoctorPrescriptions() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const { data: prescriptions, isLoading, refetch } = useListPrescriptions(undefined, {
    query: { queryKey: getListPrescriptionsQueryKey() }
  });

  const mine = (prescriptions ?? []).filter((p: any) => p.doctorId === currentUser?.id || p.doctor?.id === currentUser?.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Prescriptions</Text>
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={mine}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.patient, { color: colors.foreground }]}>{(item as any).patient?.name ?? "Patient"}</Text>
                  <Text style={[styles.medication, { color: colors.primary }]}>{(item as any).medication}</Text>
                  <Text style={[styles.dosage, { color: colors.mutedForeground }]}>{(item as any).dosage}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>{(item as any).status}</Text>
                </View>
              </View>
              <Text style={[styles.instructions, { color: colors.mutedForeground }]}>{(item as any).instructions}</Text>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date((item as any).createdAt).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="package" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No prescriptions issued</Text>
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
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 6 },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  patient: { fontSize: 15, fontWeight: "700" },
  medication: { fontSize: 15, fontWeight: "600" },
  dosage: { fontSize: 13 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  instructions: { fontSize: 13 },
  date: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
