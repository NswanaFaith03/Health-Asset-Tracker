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

export default function NurseTabLayout() {
  return (
    <TabLayout 
      allowedRoles={["nurse"]}
      headerRight={<ShiftToggle />}
    >
      <Tabs.Screen name="lab-requests" options={{ title: "Lab Requests", tabBarIcon: ({ color }) => <Feather name="clipboard" size={ICON_SIZE} color={color} /> }} />
      <Tabs.Screen name="queue-management" options={{ title: "Queue", tabBarIcon: ({ color }) => <Feather name="users" size={ICON_SIZE} color={color} /> }} />
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
