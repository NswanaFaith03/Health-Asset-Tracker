import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useGetMyQueuePosition, getGetMyQueuePositionQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentQueue() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();

  const { data: queuePosition, isLoading, refetch } = useGetMyQueuePosition({
    query: { queryKey: getGetMyQueuePositionQueryKey(), refetchInterval: 20_000 },
  });

  const isWaiting = queuePosition?.status === "waiting";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}> 
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Queue Status</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Track your current waiting position.</Text>
        </View>
        <TouchableOpacity onPress={() => refetch()} style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Feather name="refresh-cw" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : !queuePosition ? (
        <View style={styles.center}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No queue data available right now.</Text>
          <Text style={[styles.helpText, { color: colors.foreground }]}>Once you are in the queue, your position will appear here.</Text>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={[styles.circle, { borderColor: colors.primary, backgroundColor: colors.primary + "15" }]}> 
            <Text style={[styles.positionLabel, { color: colors.primary }]}>{queuePosition.position}</Text>
          </View>
          <Text style={[styles.statusText, { color: colors.foreground }]}>You are {isWaiting ? "waiting" : queuePosition.status.replace(/_/g, " ")} in the queue.</Text>
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>Position {queuePosition.position} of {queuePosition.totalInQueue}</Text>
          {queuePosition.status === "waiting" && ( 
            <Text style={[styles.detailText, { color: colors.mutedForeground }]}>We will notify you when your turn is next.</Text>
          )}
          {!isWaiting && (
            <View style={styles.noteBox}>
              <Feather name="info" size={16} color={colors.primary} />
              <Text style={[styles.noteText, { color: colors.mutedForeground }]}>If you expected to be in the queue but are not, please open your consultation or contact the clinic.</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 4 },
  refreshBtn: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  emptyText: { fontSize: 16, fontWeight: "700", marginBottom: 8, textAlign: "center" },
  helpText: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  card: { margin: 16, borderRadius: 20, borderWidth: 1, padding: 24, alignItems: "center", gap: 14 },
  circle: { width: 96, height: 96, borderRadius: 48, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  positionLabel: { fontSize: 34, fontWeight: "800" },
  statusText: { fontSize: 18, fontWeight: "700", marginTop: 8, textAlign: "center" },
  detailText: { fontSize: 14, textAlign: "center", marginTop: 4, lineHeight: 20 },
  noteBox: { marginTop: 16, width: "100%", flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(15, 118, 110, 0.08)" },
  noteText: { flex: 1, fontSize: 13, lineHeight: 20 },
});