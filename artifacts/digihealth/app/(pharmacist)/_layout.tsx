import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";

export default function PharmacistTabLayout() {
  return (
    <TabLayout allowedRoles={["pharmacist"]}>
      <Tabs.Screen name="prescriptions" options={{ title: "Pending", tabBarIcon: ({ color }) => <Feather name="package" size={22} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: ({ color }) => <Feather name="clock" size={22} color={color} /> }} />
    </TabLayout>
  );
}
