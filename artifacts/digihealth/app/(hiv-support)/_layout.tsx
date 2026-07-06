import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";

export default function HivSupportTabLayout() {
  return (
    <TabLayout allowedRoles={["hiv_support"]}>
      <Tabs.Screen name="sessions" options={{ title: "Sessions", tabBarIcon: ({ color }) => <Feather name="shield" size={22} color={color} /> }} />
      <Tabs.Screen name="resources" options={{ title: "Resources", tabBarIcon: ({ color }) => <Feather name="book-open" size={22} color={color} /> }} />
    </TabLayout>
  );
}
