import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useColors } from "../../../hooks/useColors";
import type { UserFilter } from "../constants";
import { USER_FILTERS } from "../constants";

interface FilterBarProps {
  activeFilter: UserFilter;
  onFilterChange: (filter: UserFilter) => void;
  pendingCount: number;
}

/**
 * Horizontal scrollable filter tabs for the Users list.
 *
 * Satisfies SRP: owns only filter tab rendering.
 */
export function FilterBar({ activeFilter, onFilterChange, pendingCount }: FilterBarProps) {
  const colors = useColors();

  const filters = USER_FILTERS.map((f) => ({
    ...f,
    l: f.k === "pending" && pendingCount > 0 ? `Pending (${pendingCount})` : f.l,
  }));

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {filters.map((f) => {
        const isActive = activeFilter === f.k;
        return (
          <TouchableOpacity
            key={f.k}
            onPress={() => onFilterChange(f.k as UserFilter)}
            style={[
              styles.tab,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
                borderColor: isActive ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "700",
                color: isActive ? colors.primaryForeground : colors.mutedForeground,
              }}
            >
              {f.l}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  tab: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
});
