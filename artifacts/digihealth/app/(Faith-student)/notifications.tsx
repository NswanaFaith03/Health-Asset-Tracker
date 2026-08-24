/**
 * @module Faith-Student Portal
 * @file notifications.tsx
 * @developer Faith
 * @role Senior Student Experience Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const TYPE_ICONS: Record<string, string> = {
  consultation: "clipboard", queue: "users", prescription: "package",
  lab_result: "activity", counseling: "heart", system: "bell",
};

export default function StudentNotifications() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: notifications, isLoading, refetch } = useListNotifications({
    query: { queryKey: getListNotificationsQueryKey() }
  });
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const handleMarkAllRead = () => {
    markAllRead.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  const handleMarkRead = (id: number) => {
    markRead.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    });
  };

  /**
   * Navigate to the relevant section based on notification type and linked resource ID.
   * This enables deep-linking from notifications to specific consultations, labs, prescriptions, etc.
   */
  const handleNotificationPress = (notification: any) => {
    // Mark as read if not already read
    if (!notification.readStatus) {
      handleMarkRead(notification.id);
    }

    // Route based on notification type
    const type = notification.type?.toLowerCase() || "";
    const linkedId = notification.linkedId || notification.resourceId;

    if (type === "consultation" && linkedId) {
      router.push(`/(Faith-student)/consultation-detail?id=${linkedId}` as any);
    } else if (type === "lab_result" && linkedId) {
      router.push({ pathname: "/(Faith-student)/lab-result", params: { requestId: linkedId } } as any);
    } else if (type === "prescription" && linkedId) {
      router.push(`/(Faith-student)/prescriptions?id=${linkedId}` as any);
    } else if (type === "queue") {
      router.push("/(Faith-student)/queue" as any);
    } else if (type === "counseling" || type === "mental_health") {
      router.push("/(Faith-student)/mental-buddy" as any);
    } else if (type === "hiv_support") {
      router.push("/(Faith-student)/hiv-aids" as any);
    } else {
      // Default action for system notifications - just mark as read
      if (!notification.readStatus) {
        handleMarkRead(notification.id);
      }
    }
  };

  const unreadCount = (notifications ?? []).filter((n: any) => !n.readStatus).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[styles.markAll, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={notifications ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, {
                backgroundColor: (item as any).readStatus ? colors.card : colors.primary + "08",
                borderColor: (item as any).readStatus ? colors.border : colors.primary + "30",
              }]}
              onPress={() => handleNotificationPress(item as any)}
            >
              <View style={[styles.iconWrap, { backgroundColor: colors.primary + "15" }]}>
                <Feather name={(TYPE_ICONS[(item as any).type] || "bell") as any} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTop}>
                  <Text style={[styles.notifTitle, { color: colors.foreground }]}>{(item as any).title}</Text>
                  {!(item as any).readStatus && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.message, { color: colors.mutedForeground }]}>{(item as any).message}</Text>
                <Text style={[styles.date, { color: colors.mutedForeground }]}>
                  {new Date((item as any).createdAt).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="bell-off" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No notifications</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  markAll: { fontSize: 14, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { flexDirection: "row", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifTitle: { fontSize: 14, fontWeight: "700", flex: 1 },
  message: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  date: { fontSize: 11, marginTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
