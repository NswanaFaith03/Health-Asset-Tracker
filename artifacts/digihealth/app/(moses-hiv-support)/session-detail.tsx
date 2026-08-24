/**
 * @module moses-HIV Support Portal
 * @file session-detail.tsx
 * @developer moses
 * @role Senior Mental Health & Support Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

/**
 * HIV Support Session Detail — Sprint 5 thin wrapper.
 *
 * All state and API calls delegated to `useSessionDetail` (backed by `SessionService`).
 * Sub-components: ChatView, NotesView, CompleteModal (from features/Faith-moses-support/).
 */
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { getListHivSupportSessionsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { useSessionDetail } from "../../features/Faith-moses-support/useSessionDetail";
import { ChatView } from "../../features/Faith-moses-support/components/ChatView";
import { NotesView } from "../../features/Faith-moses-support/components/NotesView";
import { CompleteModal } from "../../features/Faith-moses-support/components/CompleteModal";

export default function HivSessionDetail() {
  const { sessionId, studentName, topic } = useLocalSearchParams<{
    sessionId: string;
    studentName: string;
    topic: string;
    status: string;
  }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const id = Number(sessionId);

  const {
    messages, loading, text, setText, sending, tab, setTab,
    notes, setNotes, appointmentDate, setAppointmentDate,
    savingNotes, showComplete, setShowComplete,
    handlers,
  } = useSessionDetail({
    sessionId: id,
    apiPrefix: "/api/hiv-support",
    listQueryKey: getListHivSupportSessionsQueryKey(),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerName, { color: colors.foreground }]} numberOfLines={1}>
            {studentName ?? "Patient"}
          </Text>
          <Text style={[styles.headerTopic, { color: colors.mutedForeground }]} numberOfLines={1}>
            {topic}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.completeBtn, { backgroundColor: "#10b98120" }]}
          onPress={() => setShowComplete(true)}
        >
          <Feather name="check-circle" size={16} color="#10b981" />
          <Text style={[styles.completeBtnText, { color: "#10b981" }]}>Complete</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.border }]}>
        {(["chat", "notes"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "chat" ? "Chat" : "Notes & Appointment"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "chat" ? (
        <ChatView
          messages={messages}
          loading={loading}
          currentUserId={currentUser?.id}
          text={text}
          onChangeText={setText}
          onSend={handlers.handleSend}
          sending={sending}
          paddingBottom={insets.bottom + 8}
        />
      ) : (
        <NotesView
          notes={notes}
          onNotesChange={setNotes}
          appointmentDate={appointmentDate}
          onDateChange={setAppointmentDate}
          onSave={handlers.handleSaveNotes}
          saving={savingNotes}
          paddingBottom={insets.bottom + 40}
        />
      )}

      <CompleteModal
        visible={showComplete}
        onConfirm={handlers.handleComplete}
        onCancel={() => setShowComplete(false)}
      />
    </View>
  );
}

import { router } from "expo-router";

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 12, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerName: { fontSize: 16, fontWeight: "700" },
  headerTopic: { fontSize: 12, marginTop: 1 },
  completeBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  completeBtnText: { fontSize: 12, fontWeight: "700" },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 14, fontWeight: "600" },
});

