/**
 * @module Counseling Support Features
 * @file CompleteModal.tsx
 * @developer Faith & moses
 * @role Senior Student Experience & Mental Health Support Engineers
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "../../../hooks/useColors";

interface CompleteModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation modal for marking a session as complete.
 *
 * Satisfies SRP: owns only the confirm/cancel dialog.
 */
export function CompleteModal({ visible, onConfirm, onCancel }: CompleteModalProps) {
  const colors = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={[styles.box, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Complete Session?</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            This will mark the session as completed and notify the student.
          </Text>
          <View style={styles.btns}>
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.muted }]} onPress={onCancel}>
              <Text style={{ color: colors.foreground, fontWeight: "600" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, { backgroundColor: "#10b981" }]} onPress={onConfirm}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Complete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 24 },
  box: { width: "100%", borderRadius: 16, padding: 24, gap: 12 },
  title: { fontSize: 18, fontWeight: "700" },
  sub: { fontSize: 14, lineHeight: 20 },
  btns: { flexDirection: "row", gap: 10, marginTop: 8 },
  btn: { flex: 1, height: 44, borderRadius: 10, justifyContent: "center", alignItems: "center" },
});
