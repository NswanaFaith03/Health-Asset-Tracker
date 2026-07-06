import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";

export default function LabTabLayout() {
  return (
    <TabLayout allowedRoles={["lab_technician"]}>
      <Tabs.Screen name="requests" options={{ title: "Requests", tabBarIcon: ({ color }) => <Feather name="thermometer" size={22} color={color} /> }} />
      <Tabs.Screen name="results" options={{ title: "Results", tabBarIcon: ({ color }) => <Feather name="file-text" size={22} color={color} /> }} />
    </TabLayout>
  );
}
