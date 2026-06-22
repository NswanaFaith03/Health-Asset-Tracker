import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useGetQueue, useCompleteQueueEntry, getGetQueueQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

export default function DoctorQueue() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: queue, isLoading, refetch } = useGetQueue({ query: { queryKey: getGetQueueQueryKey() } });
  const completeEntry = useCompleteQueueEntry();

  const handleComplete = (id: number) => {
    Alert.alert("Complete", "Mark this queue entry as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          completeEntry.mutate({ id }, {
            onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey() })
          });
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Patient Queue</Text>
        <View style={[styles.countBadge, { backgroundColor: colors.primary }]}>
          <Text style={[styles.countText, { color: colors.primaryForeground }]}>{(queue ?? []).length}</Text>
        </View>
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={queue ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item, index }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: index === 0 ? colors.primary : colors.border, borderLeftWidth: index === 0 ? 3 : 1 }]}>
              <View style={styles.cardTop}>
                <View style={[styles.queueNum, { backgroundColor: index === 0 ? colors.primary : colors.muted }]}>
                  <Text style={[styles.queueNumText, { color: index === 0 ? colors.primaryForeground : colors.foreground }]}>
                    #{(item as any).queueNumber}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.patientName, { color: colors.foreground }]}>{(item as any).student?.name ?? "Patient"}</Text>
                  <Text style={[styles.symptoms, { color: colors.mutedForeground }]} numberOfLines={1}>
                    {(item as any).consultation?.symptoms}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.doneBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                  onPress={() => handleComplete((item as any).id)}
                >
                  <Feather name="check" size={18} color={colors.primaryForeground} />
                </TouchableOpacity>
              </View>
              {(item as any).estimatedWaitMinutes != null && (
                <Text style={[styles.wait, { color: colors.mutedForeground }]}>
                  Est. wait: {(item as any).estimatedWaitMinutes} min
                </Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Queue is empty</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", flex: 1 },
  countBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  countText: { fontSize: 14, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  queueNum: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  queueNumText: { fontSize: 14, fontWeight: "700" },
  patientName: { fontSize: 16, fontWeight: "700" },
  symptoms: { fontSize: 13, marginTop: 2 },
  doneBtn: { width: 38, height: 38, justifyContent: "center", alignItems: "center" },
  wait: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
