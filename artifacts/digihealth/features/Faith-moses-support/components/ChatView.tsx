/**
 * @module Counseling Support Features
 * @file ChatView.tsx
 * @developer Faith & moses
 * @role Senior Student Experience & Mental Health Support Engineers
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React from "react";
import {
  FlatList, View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../../hooks/useColors";
import { EmptyState } from "../../../components/ui/EmptyState";
import type { Message } from "../types";

interface ChatViewProps {
  messages: Message[];
  loading: boolean;
  currentUserId?: number;
  text: string;
  onChangeText: (t: string) => void;
  onSend: () => void;
  sending: boolean;
  paddingBottom?: number;
}

/**
 * Chat message list + input bar.
 *
 * Satisfies SRP: owns only chat rendering and input.
 */
export function ChatView({
  messages, loading, currentUserId, text, onChangeText, onSend, sending, paddingBottom = 8,
}: ChatViewProps) {
  const colors = useColors();
  const reversed = [...messages].reverse();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={reversed}
        keyExtractor={(item) => String(item.id)}
        inverted
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        renderItem={({ item }) => {
          const isMe = item.senderId === currentUserId;
          return (
            <View style={[styles.msgRow, { justifyContent: isMe ? "flex-end" : "flex-start" }]}>
              <View
                style={[
                  styles.bubble,
                  {
                    backgroundColor: isMe ? colors.primary : colors.card,
                    borderColor: isMe ? "transparent" : colors.border,
                  },
                ]}
              >
                {!isMe && (
                  <Text style={[styles.senderName, { color: colors.mutedForeground }]}>
                    {item.sender?.name ?? "Patient"}
                  </Text>
                )}
                <Text style={{ color: isMe ? colors.primaryForeground : colors.foreground, fontSize: 15 }}>
                  {item.content}
                </Text>
                <Text
                  style={{
                    color: isMe ? colors.primaryForeground + "99" : colors.mutedForeground,
                    fontSize: 11, marginTop: 4,
                  }}
                >
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="message-circle" message="No messages yet. Start the conversation." />
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View
          style={[
            styles.inputBar,
            { borderTopColor: colors.border, backgroundColor: colors.card, paddingBottom: paddingBottom },
          ]}
        >
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.mutedForeground}
            value={text}
            onChangeText={onChangeText}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary, opacity: !text.trim() || sending ? 0.5 : 1 }]}
            onPress={onSend}
            disabled={!text.trim() || sending}
          >
            <Feather name="send" size={18} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  msgRow: { flexDirection: "row", marginBottom: 10 },
  bubble: { maxWidth: "75%", borderRadius: 16, borderWidth: 1, padding: 12, gap: 2 },
  senderName: { fontSize: 11, fontWeight: "600" },
  inputBar: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 10, borderTopWidth: 1, alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15, maxHeight: 120 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
});
