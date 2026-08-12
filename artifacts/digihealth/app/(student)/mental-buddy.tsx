import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, TextInput, Modal, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useListMentalHealthSessions, useCreateMentalHealthSession, getListMentalHealthSessionsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const COUNSELING_BG = require("../../assets/images/happystudents.jpg");

const STATUS_COLORS: Record<string, string> = {
  requested: "#f59e0b", active: "#10b981", completed: "#6b7280", cancelled: "#ef4444",
};

export default function MentalBuddy() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  const { data: sessions, isLoading, refetch } = useListMentalHealthSessions({
    query: { queryKey: getListMentalHealthSessionsQueryKey() }
  });
  const createSession = useCreateMentalHealthSession();

  const handleCreate = () => {
    if (!topic.trim()) { Alert.alert("Required", "Please enter a topic"); return; }
    createSession.mutate(
      { data: { topic: topic.trim(), isAnonymous, initialMessage: initialMessage.trim() || undefined } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMentalHealthSessionsQueryKey() });
          setShowModal(false);
          setTopic(""); setInitialMessage(""); setIsAnonymous(false);
        },
        onError: () => Alert.alert("Error", "Failed to create session")
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={COUNSELING_BG}
        style={[styles.heroBg, { paddingTop: insets.top }]}
        imageStyle={styles.heroImg}
      >
        <View style={styles.heroOverlay}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Mental Buddy</Text>
            <Text style={styles.heroSub}>Confidential mental health support</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setShowModal(true)}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={sessions ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 16 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push({ pathname: "/(student)/mental-buddy-chat", params: { sessionId: (item as any).id } })}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: "#ec489920" }]}>
                  <Feather name="heart" size={18} color="#ec4899" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sessionTopic, { color: colors.foreground }]}>{(item as any).topic}</Text>
                  {(item as any).isAnonymous && (
                    <Text style={[styles.anonTag, { color: colors.mutedForeground }]}>Anonymous</Text>
                  )}
                </View>
                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>{(item as any).status}</Text>
                </View>
              </View>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {new Date((item as any).createdAt).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="heart" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sessions yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>Talk to a counselor, anonymously or identified</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Session</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>What do you want to talk about?</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Stress, relationships, anxiety..."
            placeholderTextColor={colors.mutedForeground}
            value={topic}
            onChangeText={setTopic}
          />
          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Initial message (optional)</Text>
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="Share a bit about what's on your mind..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            value={initialMessage}
            onChangeText={setInitialMessage}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.anonToggle, { borderColor: isAnonymous ? colors.primary : colors.border }]}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <Feather name={isAnonymous ? "check-square" : "square"} size={20} color={isAnonymous ? colors.primary : colors.mutedForeground} />
            <Text style={[styles.anonLabel, { color: colors.foreground }]}>Remain anonymous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: createSession.isPending ? 0.7 : 1 }]}
            onPress={handleCreate}
            disabled={createSession.isPending}
          >
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {createSession.isPending ? "Creating..." : "Start Session"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBg: { height: 160, justifyContent: "flex-end" },
  heroImg: { resizeMode: "cover" },
  heroOverlay: {
    flexDirection: "row", alignItems: "flex-end", gap: 12,
    paddingHorizontal: 16, paddingBottom: 16, paddingTop: 12,
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  heroTitle: { fontSize: 24, fontWeight: "800", color: "#fff" },
  heroSub: { fontSize: 13, color: "rgba(255,255,255,0.80)", marginTop: 3 },
  newBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.20)", justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  sessionTopic: { fontSize: 15, fontWeight: "600" },
  anonTag: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 11 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { fontSize: 13, textAlign: "center" },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, height: 48, paddingHorizontal: 14, fontSize: 15 },
  textArea: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15, minHeight: 100 },
  anonToggle: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 10, padding: 14, marginTop: 16 },
  anonLabel: { fontSize: 15 },
  submitBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 24 },
  submitText: { fontSize: 16, fontWeight: "700" },
});
