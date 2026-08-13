import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useListMentalHealthSessions, useUpdateMentalHealthSession, getListMentalHealthSessionsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { AnimatedButton } from "../../components/AnimatedButton";

const STATUS_COLORS: Record<string, string> = {
  requested: "#f59e0b", active: "#10b981", completed: "#6b7280", cancelled: "#ef4444",
};

export default function CounselorSessions() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { data: sessions, isLoading, refetch } = useListMentalHealthSessions({
    query: { queryKey: getListMentalHealthSessionsQueryKey() }
  });
  const updateSession = useUpdateMentalHealthSession();

  const handleAccept = (id: number) => {
    Toast.info("Accepting session...");
    updateSession.mutate(
      { id, data: { status: "active" } },
      { 
        onSuccess: () => {
          Toast.success("Session accepted");
          queryClient.invalidateQueries({ queryKey: getListMentalHealthSessionsQueryKey() });
        },
        onError: (err: any) => Toast.error(err?.message || "Failed to accept session")
      }
    );
  };

  const handleComplete = (id: number) => {
    Toast.info("Completing session...");
    updateSession.mutate(
      { id, data: { status: "completed" } },
      { 
        onSuccess: () => {
          Toast.success("Session completed");
          queryClient.invalidateQueries({ queryKey: getListMentalHealthSessionsQueryKey() });
        },
        onError: (err: any) => Toast.error(err?.message || "Failed to complete session")
      }
    );
  };

  return (
    <>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require("../../assets/images/Couseling background.jpeg")}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Text style={styles.kicker}>Mental Health Support</Text>
          <Text style={styles.title}>Counseling Sessions</Text>
        </View>
      </ImageBackground>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={sessions ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: "#ec489915" }]}>
                  <Feather name="heart" size={18} color="#ec4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentName, { color: colors.foreground }]}>
                    {(item as any).isAnonymous ? "Anonymous Student" : (item as any).student?.name ?? "Student"}
                  </Text>
                  <Text style={[styles.topic, { color: colors.mutedForeground }]} numberOfLines={1}>{(item as any).topic}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>{(item as any).status}</Text>
                </View>
              </View>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date((item as any).createdAt).toLocaleDateString()}</Text>
              <View style={styles.actions}>
                {(item as any).status === "requested" && (
                  <AnimatedButton
                    label="Accept"
                    onPress={() => handleAccept((item as any).id)}
                    isLoading={updateSession.isPending}
                    style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                    textColor={colors.primaryForeground}
                  />
                )}
                {(item as any).status === "active" && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
                      onPress={() => router.push({ pathname: "/(mental-health)/session-detail" as any, params: { sessionId: (item as any).id } })}
                    >
                      <Text style={[styles.actionBtnText, { color: colors.primary }]}>Open Chat</Text>
                    </TouchableOpacity>
                    <AnimatedButton
                      label="Complete"
                      onPress={() => handleComplete((item as any).id)}
                      isLoading={updateSession.isPending}
                      style={[styles.actionBtn, { backgroundColor: colors.muted, borderRadius: colors.radius }]}
                      textColor={colors.foreground}
                    />
                  </>
                )}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sessions</Text>
            </View>
          }
        />
      )}
      <ToastContainer position="top" />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 18, minHeight: 140, justifyContent: "flex-end" },
  headerImage: { opacity: 0.2 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  headerContent: { position: "relative", zIndex: 1 },
  kicker: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  title: { fontSize: 24, fontWeight: "800", color: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  studentName: { fontSize: 15, fontWeight: "700" },
  topic: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 12 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { paddingHorizontal: 16, paddingVertical: 8 },
  actionBtnText: { fontSize: 14, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
