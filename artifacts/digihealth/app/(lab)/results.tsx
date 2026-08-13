import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListLabRequests, getListLabRequestsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { SCREEN_IMAGES } from "@/constants/hospitalImages";

export default function LabResults() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: requests, isLoading, refetch } = useListLabRequests({ status: "completed" }, {
    query: { queryKey: getListLabRequestsQueryKey({ status: "completed" }) }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={{ uri: SCREEN_IMAGES.lab.results }}
        style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={[styles.title, { color: "#fff", position: "relative", zIndex: 1 }]}>Completed Tests</Text>
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
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <Feather name="file-text" size={18} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.patient, { color: colors.foreground }]}>{(item as any).patient?.name ?? "Patient"}</Text>
                  <Text style={[styles.testType, { color: colors.primary }]}>{(item as any).testType}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: "#10b98120" }]}>
                  <Text style={[styles.badgeText, { color: "#10b981" }]}>Completed</Text>
                </View>
              </View>
              {(item as any).result && (
                <View style={[styles.resultSection, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.resultLabel, { color: colors.mutedForeground }]}>Results</Text>
                  <Text style={[styles.resultText, { color: colors.foreground }]}>{(item as any).result?.results}</Text>
                </View>
              )}
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date((item as any).updatedAt).toLocaleDateString()}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="file-text" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No completed tests</Text>
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
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(124, 58, 237, 0.65)" },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", position: "relative", zIndex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  patient: { fontSize: 15, fontWeight: "700" },
  testType: { fontSize: 15, fontWeight: "600" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  resultSection: { borderRadius: 8, borderWidth: 1, padding: 12, gap: 4 },
  resultLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase" },
  resultText: { fontSize: 14, lineHeight: 20 },
  date: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
