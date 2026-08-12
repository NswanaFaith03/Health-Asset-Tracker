import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColors } from "../../hooks/useColors";

interface ChipOption {
  key: string;
  label: string;
  /** Optional accent color for the active state. Falls back to theme primary. */
  color?: string;
}

interface ChipGroupProps {
  options: ChipOption[];
  /** Keys of currently selected options. Pass a single-item array for single-select. */
  selected: string[];
  onToggle: (key: string) => void;
  /** Wrap chips across multiple rows (default: true). */
  wrap?: boolean;
}

/**
 * Reusable chip/pill selector.
 *
 * Satisfies SRP: owns only selection rendering logic.
 * Satisfies OCP: extended via `options` — callers define the set, not this file.
 */
export function ChipGroup({ options, selected, onToggle, wrap = true }: ChipGroupProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, wrap && styles.wrap]}>
      {options.map((opt) => {
        const isActive = selected.includes(opt.key);
        const accentColor = opt.color ?? colors.primary;

        return (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.chip,
              {
                backgroundColor: isActive ? accentColor + "22" : colors.card,
                borderColor: isActive ? accentColor : colors.border,
              },
            ]}
            onPress={() => onToggle(opt.key)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.label,
                {
                  color: isActive ? accentColor : colors.mutedForeground,
                  fontWeight: isActive ? "700" : "400",
                },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 8 },
  wrap: { flexWrap: "wrap" },
  chip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  label: { fontSize: 13 },
});
