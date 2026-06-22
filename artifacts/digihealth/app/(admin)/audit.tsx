import React from "react";
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useListAuditLogs, getListAuditLogsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

export default function AuditLogs() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { data: logs, isLoading, refetch } = useListAuditLogs(undefined, {
    query: { queryKey: getListAuditLogsQueryKey() }
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Audit Logs</Text>
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={logs ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.row}>
                <View style={[styles.actionBadge, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[styles.action, { color: colors.primary }]}>{(item as any).action?.replace(/_/g, " ")}</Text>
                </View>
                <Text style={[styles.resource, { color: colors.mutedForeground }]}>{(item as any).resource}</Text>
                {(item as any).resourceId && (
                  <Text style={[styles.resourceId, { color: colors.mutedForeground }]}>#{(item as any).resourceId}</Text>
                )}
              </View>
              {(item as any).details && <Text style={[styles.details, { color: colors.foreground }]}>{(item as any).details}</Text>}
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date((item as any).createdAt).toLocaleString()}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="file-text" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No audit logs</Text>
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
  card: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8, gap: 6 },
  row: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  actionBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  action: { fontSize: 12, fontWeight: "700" },
  resource: { fontSize: 12 },
  resourceId: { fontSize: 12 },
  details: { fontSize: 13 },
  date: { fontSize: 11 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
