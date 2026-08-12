import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../hooks/useColors";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

interface EmptyStateProps {
  icon?: FeatherName;
  message: string;
  subMessage?: string;
}

/**
 * Centered icon + message empty state.
 *
 * Satisfies SRP: owns only empty-state presentation.
 */
export function EmptyState({ icon = "inbox", message, subMessage }: EmptyStateProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      <Feather name={icon} size={48} color={colors.mutedForeground} />
      <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text>
      {subMessage && (
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>{subMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
    paddingHorizontal: 32,
  },
  message: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  sub: { fontSize: 13, textAlign: "center", lineHeight: 18 },
});
