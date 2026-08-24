/**
 * @module Consultation Features
 * @file SeverityPicker.tsx
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "../../../hooks/useColors";
import { SEVERITIES } from "../constants";
import type { SeverityKey } from "../types";

interface SeverityPickerProps {
  value: SeverityKey;
  onChange: (key: SeverityKey) => void;
}

/**
 * Four-card severity selector.
 *
 * Satisfies SRP: owns only severity selection UI.
 * Satisfies OCP: the SEVERITIES array is extended externally — this component never changes.
 */
export function SeverityPicker({ value, onChange }: SeverityPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.grid}>
      {SEVERITIES.map((s) => (
        <TouchableOpacity
          key={s.key}
          style={[
            styles.card,
            {
              borderColor: value === s.key ? s.color : colors.border,
              backgroundColor: value === s.key ? s.color + "15" : colors.card,
            },
          ]}
          onPress={() => onChange(s.key)}
          activeOpacity={0.8}
        >
          <View style={[styles.dot, { backgroundColor: s.color }]} />
          <Text style={[styles.label, { color: value === s.key ? s.color : colors.foreground }]}>
            {s.label}
          </Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{s.desc}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: { width: "47%", borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 2 },
  label: { fontSize: 15, fontWeight: "700" },
  desc: { fontSize: 12 },
});
