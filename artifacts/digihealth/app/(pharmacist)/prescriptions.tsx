import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { FeatureActionGrid } from "@/components/FeatureActionGrid";
import { useListPrescriptions, useDispensePrescription, getListPrescriptionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { SCREEN_IMAGES } from "@/constants/hospitalImages";

export default function PharmacistPrescriptions() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const { data: prescriptions, isLoading, refetch } = useListPrescriptions({ status: "pending" }, {
    query: { queryKey: getListPrescriptionsQueryKey({ status: "pending" }) }
  });
  const dispense = useDispensePrescription();

  const actions = [
    { label: "History", icon: "clock" as any, color: "#6d28d9", onPress: () => router.push("/(pharmacist)/history") },
    { label: "Refresh", icon: "refresh-cw" as any, color: colors.primary, onPress: () => refetch() },
  ];

  const handleDispense = (id: number) => {
    Alert.alert("Dispense", "Confirm dispensing this medication?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Dispense",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          dispense.mutate(
            { id, data: { dispensedBy: currentUser?.id ?? 0 } },
            { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPrescriptionsQueryKey({ status: "pending" }) }) }
          );
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={{ uri: SCREEN_IMAGES.pharmacist.prescriptions }}
        style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={[styles.title, { color: "#000000", position: "relative", zIndex: 1 }]}>Pending Prescriptions</Text>
      </ImageBackground>
      <FeatureActionGrid actions={actions} />
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
                <View style={{ flex: 1 }}>
                  <Text style={[styles.patientName, { color: colors.foreground }]}>{(item as any).patient?.name ?? "Patient"}</Text>
                  <Text style={[styles.medication, { color: colors.primary }]}>{(item as any).medication}</Text>
                  <Text style={[styles.dosage, { color: colors.mutedForeground }]}>{(item as any).dosage}</Text>
                </View>
              </View>
              <Text style={[styles.instructions, { color: colors.foreground }]}>{(item as any).instructions}</Text>
              {(item as any).duration && <Text style={[styles.duration, { color: colors.mutedForeground }]}>Duration: {(item as any).duration}</Text>}
              <Text style={[styles.doctor, { color: colors.mutedForeground }]}>Prescribed by Dr. {(item as any).doctor?.name}</Text>
              <TouchableOpacity
                style={[styles.dispenseBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                onPress={() => handleDispense((item as any).id)}
              >
                <Feather name="check-circle" size={18} color={colors.primaryForeground} />
                <Text style={[styles.dispenseBtnText, { color: colors.primaryForeground }]}>Dispense</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="package" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No pending prescriptions</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroHeader: { paddingHorizontal: 16, paddingBottom: 16, position: "relative", minHeight: 120, justifyContent: "flex-end" },
  headerImage: { opacity: 0.35, resizeMode: "cover" },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", position: "relative", zIndex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  patientName: { fontSize: 16, fontWeight: "700" },
  medication: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  dosage: { fontSize: 13, marginTop: 2 },
  instructions: { fontSize: 14 },
  duration: { fontSize: 13 },
  doctor: { fontSize: 12 },
  dispenseBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44, marginTop: 4 },
  dispenseBtnText: { fontSize: 15, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
