import { useState, useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { SessionService } from "./SessionService";
import type { Message } from "./types";

interface UseSessionDetailOptions {
  sessionId: number;
  /** API prefix, e.g. "/api/hiv-support" or "/api/mental-health" */
  apiPrefix: string;
  /** Query key to invalidate when session is updated. */
  listQueryKey: unknown[];
}

/**
 * Owns all state and side-effects for a session-detail screen.
 *
 * Satisfies SRP: screens delegate all logic here; they only render.
 * Satisfies DIP: depends on SessionService, not on customFetch.
 *
 * Used by: (hiv-support)/session-detail.tsx, (mental-health)/session-detail.tsx
 */
export function useSessionDetail({
  sessionId,
  apiPrefix,
  listQueryKey,
}: UseSessionDetailOptions) {
  const queryClient = useQueryClient();
  const service = useMemo(() => new SessionService(apiPrefix), [apiPrefix]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"chat" | "notes">("chat");
  const [notes, setNotes] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    service
      .fetchMessages(sessionId)
      .then((data) => setMessages(data ?? []))
      .catch(() => setMessages([]))
      .finally(() => setLoading(false));
  }, [sessionId, service]);

  const handleSend = async () => {
    const content = text.trim();
    if (!content) return;
    setSending(true);
    setText("");
    try {
      const msg = await service.sendMessage(sessionId, content);
      setMessages((prev) => [...prev, msg]);
    } catch {
      Alert.alert("Error", "Could not send message");
    } finally {
      setSending(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await service.saveNotes(sessionId, notes, appointmentDate);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
      Alert.alert("Saved", "Session notes updated.");
    } catch {
      Alert.alert("Error", "Could not save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleComplete = async () => {
    try {
      await service.complete(sessionId);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
      Alert.alert("Done", "Session marked as completed.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert("Error", "Could not complete session");
    }
    setShowComplete(false);
  };

  return {
    messages,
    loading,
    text, setText,
    sending,
    tab, setTab,
    notes, setNotes,
    appointmentDate, setAppointmentDate,
    savingNotes,
    showComplete, setShowComplete,
    handlers: { handleSend, handleSaveNotes, handleComplete },
  };
}
