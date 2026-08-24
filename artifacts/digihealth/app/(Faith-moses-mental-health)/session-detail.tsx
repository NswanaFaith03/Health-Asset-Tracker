/**
 * @module Faith-moses-Mental Health Portal
 * @file session-detail.tsx
 * @developer Faith & moses
 * @role Senior Student Experience & Mental Health Support Engineers
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

/**
 * Counselor / Mental Health Session Detail — Sprint 5 thin wrapper.
 *
 * Uses the shared `ChatView` component from `features/Faith-moses-support/components/ChatView`.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMentalHealthMessages,
  useSendMentalHealthMessage,
  getGetMentalHealthMessagesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { ChatView } from "../../features/Faith-moses-support/components/ChatView";

export default function CounselorSessionDetail() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const id = Number(sessionId);

  const { data: messages, isLoading } = useGetMentalHealthMessages(id, {
    query: { enabled: !!id, queryKey: getGetMentalHealthMessagesQueryKey(id) },
  });
  const sendMessage = useSendMentalHealthMessage();

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    sendMessage.mutate(
      { sessionId: id, data: { content } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMentalHealthMessagesQueryKey(id) }) }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Session Chat</Text>
        <View style={{ width: 40 }} />
      </View>

      <ChatView
        messages={(messages ?? []) as any}
        loading={isLoading}
        currentUserId={currentUser?.id}
        text={text}
        onChangeText={setText}
        onSend={handleSend}
        sending={sendMessage.isPending}
        paddingBottom={insets.bottom + 8}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
});
