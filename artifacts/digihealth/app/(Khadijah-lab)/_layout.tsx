/**
 * @module Khadijah-Lab Portal
 * @file _layout.tsx
 * @developer Khadijah
 * @role Senior Diagnostics & Pharmacy Integration Specialist
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";
import { useAuth } from "@/contexts/AuthContext";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";

const ICON_SIZE = 22;

function ShiftToggle() {
  const { isOnShift, startShift, endShift } = useAuth();
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.shiftToggle, { backgroundColor: isOnShift ? colors.primary : colors.muted }]}
      onPress={isOnShift ? endShift : startShift}
    >
      <View style={[styles.dot, { backgroundColor: isOnShift ? colors.primaryForeground : colors.foreground }]} />
      <Text style={[styles.shiftText, { color: isOnShift ? colors.primaryForeground : colors.foreground }]}>
        {isOnShift ? "On Shift" : "Off Shift"}
      </Text>
    </TouchableOpacity>
  );
}

export default function LabTabLayout() {
  return (
    <TabLayout 
      allowedRoles={["lab_technician"]}
      headerRight={<ShiftToggle />}
    >
      <Tabs.Screen name="requests" options={{ title: "Requests", tabBarIcon: ({ color }) => <Feather name="thermometer" size={ICON_SIZE} color={color} /> }} />
      <Tabs.Screen name="results" options={{ title: "Results", tabBarIcon: ({ color }) => <Feather name="file-text" size={ICON_SIZE} color={color} /> }} />
    </TabLayout>
  );
}

const styles = StyleSheet.create({
  shiftToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shiftText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
