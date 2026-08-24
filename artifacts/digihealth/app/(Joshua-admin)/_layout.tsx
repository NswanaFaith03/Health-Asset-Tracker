/**
 * @module Joshua-Admin Portal
 * @file _layout.tsx
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";

export default function AdminTabLayout() {
  return (
    <TabLayout allowedRoles={["admin"]}>
      <Tabs.Screen name="analytics" options={{ title: "Analytics", tabBarIcon: ({ color }) => <Feather name="bar-chart-2" size={22} color={color} /> }} />
      <Tabs.Screen name="users" options={{ title: "Users", tabBarIcon: ({ color }) => <Feather name="users" size={22} color={color} /> }} />
      <Tabs.Screen name="emergency" options={{ title: "Emergency", tabBarIcon: ({ color }) => <Feather name="phone" size={22} color={color} /> }} />
      <Tabs.Screen name="audit" options={{ title: "Audit", tabBarIcon: ({ color }) => <Feather name="list" size={22} color={color} /> }} />
    </TabLayout>
  );
}
