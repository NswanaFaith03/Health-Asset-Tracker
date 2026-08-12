import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert, TextInput, Modal, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useListHivSupportSessions, useListHivResources, useCreateHivSupportSession, getListHivSupportSessionsQueryKey, getListHivResourcesQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const COUNSELING_BG = require("../../assets/images/zambia_graduate_nurses.jpg");

const STATUS_COLORS: Record<string, string> = {
  requested: "#f59e0b", active: "#10b981", completed: "#6b7280", cancelled: "#ef4444",
};

export default function HivAids() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [topic, setTopic] = useState("");
  const [activeTab, setActiveTab] = useState<"sessions" | "resources">("sessions");

  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = useListHivSupportSessions({
    query: { queryKey: getListHivSupportSessionsQueryKey() }
  });
  const { data: resources, isLoading: resourcesLoading, refetch: refetchResources } = useListHivResources({
    query: { queryKey: getListHivResourcesQueryKey() }
  });
  const createSession = useCreateHivSupportSession();

  const handleCreate = () => {
    if (!topic.trim()) { Alert.alert("Required", "Please enter a topic"); return; }
    createSession.mutate(
      { data: { topic: topic.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListHivSupportSessionsQueryKey() });
          setShowModal(false); setTopic("");
        },
        onError: () => Alert.alert("Error", "Failed to submit request")
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
            <Text style={styles.heroTitle}>HIV/AIDS Centre</Text>
            <Text style={styles.heroSub}>Confidential support & resources</Text>
          </View>
          <TouchableOpacity
            style={styles.newBtn}
            onPress={() => setShowModal(true)}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["sessions", "resources"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.mutedForeground }]}>
              {tab === "sessions" ? "My Sessions" : "Resources"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 84 }}
        refreshControl={
          <RefreshControl
            refreshing={activeTab === "sessions" ? sessionsLoading : resourcesLoading}
            onRefresh={activeTab === "sessions" ? refetchSessions : refetchResources}
          />
        }
      >
        {activeTab === "sessions" ? (
          (sessions ?? []).length === 0 ? (
            <View style={styles.empty}>
              <Feather name="shield" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No sessions yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.mutedForeground }]}>All consultations are strictly confidential</Text>
            </View>
          ) : (
            (sessions ?? []).map((item: any) => (
              <View key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardTop}>
                  <Text style={[styles.sessionTopic, { color: colors.foreground }]}>{item.topic}</Text>
                  <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + "20" }]}>
                    <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>{item.status}</Text>
                  </View>
                </View>
                {item.notes && <Text style={[styles.notes, { color: colors.mutedForeground }]}>{item.notes}</Text>}
                {item.appointmentDate && (
                  <Text style={[styles.appt, { color: colors.primary }]}>
                    Appointment: {new Date(item.appointmentDate).toLocaleString()}
                  </Text>
                )}
                <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
            ))
          )
        ) : (
          (resources ?? []).length === 0 ? (
            <View style={styles.empty}>
              <Feather name="book-open" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No resources available</Text>
            </View>
          ) : (
            (resources ?? []).map((r: any) => (
              <View key={r.id} style={[styles.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.categoryBadge, { backgroundColor: colors.primary + "15" }]}>
                  <Text style={[styles.categoryText, { color: colors.primary }]}>{r.category}</Text>
                </View>
                <Text style={[styles.resourceTitle, { color: colors.foreground }]}>{r.title}</Text>
                <Text style={[styles.resourceContent, { color: colors.mutedForeground }]}>{r.content}</Text>
              </View>
            ))
          )
        )}
      </ScrollView>

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Request Support</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>What do you need help with?</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. HIV testing, counseling, treatment..."
            placeholderTextColor={colors.mutedForeground}
            value={topic}
            onChangeText={setTopic}
          />
          <Text style={[styles.confidentialNote, { color: colors.mutedForeground, backgroundColor: colors.muted }]}>
            All sessions are strictly confidential. Your privacy is protected.
          </Text>
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleCreate}
            disabled={createSession.isPending}
          >
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {createSession.isPending ? "Submitting..." : "Request Support"}
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
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 15, fontWeight: "600" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  sessionTopic: { fontSize: 15, fontWeight: "600", flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  notes: { fontSize: 13 },
  appt: { fontSize: 13, fontWeight: "600" },
  date: { fontSize: 11 },
  resourceCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  categoryText: { fontSize: 12, fontWeight: "700" },
  resourceTitle: { fontSize: 16, fontWeight: "700" },
  resourceContent: { fontSize: 14, lineHeight: 20 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  emptySubtext: { fontSize: 13, textAlign: "center" },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, height: 48, paddingHorizontal: 14, fontSize: 15, marginBottom: 16 },
  confidentialNote: { padding: 12, borderRadius: 8, fontSize: 13, lineHeight: 18 },
  submitBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 20 },
  submitText: { fontSize: 16, fontWeight: "700" },
});
