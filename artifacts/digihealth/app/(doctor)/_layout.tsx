import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";

const ICON_SIZE = 22;

export default function DoctorTabLayout() {
  return (
    <TabLayout allowedRoles={["doctor"]}>
      <Tabs.Screen
        name="queue"
        options={{ title: "Queue", tabBarIcon: ({ color }) => <Feather name="users" size={ICON_SIZE} color={color} /> }}
      />
      <Tabs.Screen
        name="consultations"
        options={{ title: "Consult", tabBarIcon: ({ color }) => <Feather name="activity" size={ICON_SIZE} color={color} /> }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{ title: "Prescribe", tabBarIcon: ({ color }) => <Feather name="clipboard" size={ICON_SIZE} color={color} /> }}
      />
      <Tabs.Screen
        name="lab-requests"
        options={{ title: "Lab", tabBarIcon: ({ color }) => <Feather name="thermometer" size={ICON_SIZE} color={color} /> }}
      />
      <Tabs.Screen name="consultation-detail" options={{ href: null }} />
    </TabLayout>
  );
}
