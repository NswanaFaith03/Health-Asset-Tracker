import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface BadgeProps {
  /** The status/severity key used to look up a color. */
  status: string;
  /** Map of key → hex color. Open/Closed: callers extend by passing a new map. */
  colorMap: Record<string, string>;
  /** Optional display label override. Defaults to status with underscores replaced. */
  label?: string;
  size?: "sm" | "md";
}

/**
 * Generic status / severity badge.
 *
 * Satisfies OCP: behaviour is extended via `colorMap`, never by editing this file.
 *
 * Usage:
 *   <Badge status="submitted" colorMap={STATUS_COLORS} />
 *   <Badge status="critical"  colorMap={SEVERITY_COLORS} />
 */
export function Badge({ status, colorMap, label, size = "md" }: BadgeProps) {
  const color = colorMap[status] ?? "#6b7280";
  const displayLabel = label ?? status.replace(/_/g, " ");

  return (
    <View style={[styles.badge, { backgroundColor: color + "20" }, size === "sm" && styles.badgeSm]}>
      <Text style={[styles.text, { color }, size === "sm" && styles.textSm]}>
        {displayLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  badgeSm: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  textSm: {
    fontSize: 10,
  },
});
