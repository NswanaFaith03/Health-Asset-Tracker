/**
 * @module Faith-Student Portal
 * @file mental-buddy-chat.tsx
 * @developer Faith
 * @role Senior Student Experience Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMentalHealthMessages, useSendMentalHealthMessage, getGetMentalHealthMessagesQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

export default function MentalBuddyChat() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const id = Number(sessionId);

  const { data: messages, isLoading, refetch } = useGetMentalHealthMessages(id, {
    query: { enabled: !!id, queryKey: getGetMentalHealthMessagesQueryKey(id) }
  });
  const sendMessage = useSendMentalHealthMessage();

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    sendMessage.mutate(
      { sessionId: id, data: { content } },
      {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetMentalHealthMessagesQueryKey(id) }),
      }
    );
  };

  const reversed = [...(messages ?? [])].reverse();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Mental Buddy</Text>
        <View style={{ width: 40 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={reversed}
          keyExtractor={(item) => String((item as any).id)}
          inverted
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 16 }}
          renderItem={({ item }) => {
            const isMe = (item as any).senderId === currentUser?.id;
            return (
              <View style={[styles.msgRow, { justifyContent: isMe ? "flex-end" : "flex-start" }]}>
                <View style={[
                  styles.bubble,
                  { backgroundColor: isMe ? colors.primary : colors.card, borderColor: isMe ? "transparent" : colors.border }
                ]}>
                  <Text style={{ color: isMe ? colors.primaryForeground : colors.foreground, fontSize: 15 }}>
                    {(item as any).content}
                  </Text>
                  <Text style={{ color: isMe ? colors.primaryForeground + "99" : colors.mutedForeground, fontSize: 11, marginTop: 4 }}>
                    {new Date((item as any).createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Feather name="message-circle" size={40} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No messages yet. Start the conversation.</Text>
            </View>
          }
        />
      )}

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={0}>
        <View style={[styles.inputBar, { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={setText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Feather name="send" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 18, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  msgRow: { flexDirection: "row", marginBottom: 10 },
  bubble: { maxWidth: "75%", borderRadius: 16, borderWidth: 1, padding: 12 },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 14, textAlign: "center" },
  inputBar: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, maxHeight: 120 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
});
