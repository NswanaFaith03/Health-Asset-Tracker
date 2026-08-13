import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useListLabRequests, getListLabRequestsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { SCREEN_IMAGES } from "@/constants/hospitalImages";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", in_progress: "#3b82f6", completed: "#10b981", cancelled: "#ef4444",
};

export default function StudentLab() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: requests, isLoading, refetch } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={{ uri: SCREEN_IMAGES.student.lab }}
        style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={[styles.title, { color: "#000000", position: "relative", zIndex: 1 }]}>Lab Tests</Text>
      </ImageBackground>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={requests ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: "/(student)/lab-result", params: { requestId: (item as any).id } })}
            >
              <View style={styles.cardTop}>
                <Feather name="activity" size={20} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.testType, { color: colors.foreground }]}>{(item as any).testType}</Text>
                  {(item as any).notes && <Text style={[styles.notes, { color: colors.mutedForeground }]}>{(item as any).notes}</Text>}
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>
                    {(item as any).status?.replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
              <View style={[styles.resultBar, { backgroundColor: colors.accent + "15" }]}> 
                <Feather name="file-text" size={14} color={colors.accent} />
                <Text style={[styles.resultText, { color: colors.accent }]}>Tap to open lab request details</Text>
              </View>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {new Date((item as any).createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="activity" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No lab tests requested</Text>
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
  card: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 12, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  testType: { fontSize: 16, fontWeight: "700" },
  notes: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  resultBar: { flexDirection: "row", alignItems: "center", gap: 6, padding: 8, borderRadius: 8 },
  resultText: { fontSize: 13, fontWeight: "500" },
  date: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
