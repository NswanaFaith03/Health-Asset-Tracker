import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";

export default function MentalHealthTabLayout() {
  return (
    <TabLayout allowedRoles={["mental_health_counselor"]}>
      <Tabs.Screen name="sessions" options={{ title: "Sessions", tabBarIcon: ({ color }) => <Feather name="heart" size={22} color={color} /> }} />
      <Tabs.Screen name="session-detail" options={{ href: null }} />
    </TabLayout>
  );
}
