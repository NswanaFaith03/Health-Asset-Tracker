import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useGetLabResult, getGetLabResultQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

export default function LabResultScreen() {
  const { requestId } = useLocalSearchParams<{ requestId: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const id = Number(requestId);

  const { data: result, isLoading } = useGetLabResult(id, {
    query: { enabled: !!id, queryKey: getGetLabResultQueryKey(id) }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Lab Result</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : !result ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={48} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Result not found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.successBadge, { backgroundColor: "#10b98115" }]}>
              <Feather name="check-circle" size={18} color="#10b981" />
              <Text style={[styles.successText, { color: "#10b981" }]}>Results Available</Text>
            </View>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Test Results</Text>
            <Text style={[styles.resultsText, { color: colors.foreground }]}>{(result as any).results}</Text>
            {(result as any).uploadedAt && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Uploaded</Text>
                <Text style={[styles.dateText, { color: colors.foreground }]}>
                  {new Date((result as any).uploadedAt).toLocaleString()}
                </Text>
              </>
            )}
          </View>
          <View style={[styles.noteCard, { backgroundColor: colors.muted + "40", borderColor: colors.border }]}>
            <Feather name="info" size={16} color={colors.primary} />
            <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
              Please discuss these results with your doctor during your next consultation for proper interpretation.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  card: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  successBadge: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 8 },
  successText: { fontSize: 14, fontWeight: "700" },
  sectionLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  resultsText: { fontSize: 15, lineHeight: 22 },
  divider: { height: 1 },
  dateText: { fontSize: 14 },
  noteCard: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 12 },
  noteText: { flex: 1, fontSize: 13, lineHeight: 18 },
  emptyText: { fontSize: 16, marginTop: 8 },
});
