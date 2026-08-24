/**
 * @module Counseling Support Features
 * @file NotesView.tsx
 * @developer Faith & moses
 * @role Senior Student Experience & Mental Health Support Engineers
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useColors } from "../../../hooks/useColors";

interface NotesViewProps {
  notes: string;
  onNotesChange: (text: string) => void;
  appointmentDate: string;
  onDateChange: (text: string) => void;
  onSave: () => void;
  saving: boolean;
  paddingBottom?: number;
}

/**
 * Session notes and appointment date form.
 *
 * Satisfies SRP: owns only the notes editing UI.
 */
export function NotesView({
  notes, onNotesChange, appointmentDate, onDateChange, onSave, saving, paddingBottom = 40,
}: NotesViewProps) {
  const colors = useColors();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom }}>
      <Text style={[styles.label, { color: colors.foreground }]}>Session Notes</Text>
      <TextInput
        style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
        placeholder="Add notes about this session..."
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        value={notes}
        onChangeText={onNotesChange}
      />
      <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Appointment Date & Time</Text>
      <TextInput
        style={[styles.inputField, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
        placeholder="e.g. 2026-07-15T10:00"
        placeholderTextColor={colors.mutedForeground}
        value={appointmentDate}
        onChangeText={onDateChange}
      />
      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
        onPress={onSave}
        disabled={saving}
      >
        <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
          {saving ? "Saving..." : "Save Notes"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  textArea: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15, minHeight: 120 },
  inputField: { borderWidth: 1, borderRadius: 10, height: 48, paddingHorizontal: 14, fontSize: 15 },
  saveBtn: { height: 52, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 20 },
  saveBtnText: { fontSize: 16, fontWeight: "700" },
});
