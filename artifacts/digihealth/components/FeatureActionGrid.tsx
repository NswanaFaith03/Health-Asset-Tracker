import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../hooks/useColors";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

type ActionItem = {
  label: string;
  icon: FeatherName;
  onPress: () => void;
  color?: string;
};

type FeatureActionGridProps = {
  actions: ActionItem[];
};

export function FeatureActionGrid({ actions }: FeatureActionGridProps) {
  const colors = useColors();

  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.label}
          style={[styles.button, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={action.onPress}
          activeOpacity={0.75}
        >
          <View style={[styles.iconBox, { backgroundColor: (action.color ?? colors.primary) + "22" }]}> 
            <Feather name={action.icon} size={24} color={action.color ?? colors.primary} />
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 16,
  },
  button: {
    width: "48%",
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 18,
  },
});
