import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { TabLayout } from "@/components/TabLayout";

const ICON_SIZE = 22;

export default function StudentTabLayout() {
  return (
    <TabLayout allowedRoles={["student"]}>
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: ({ color }) => <Feather name="home" size={ICON_SIZE} color={color} /> }}
      />
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
        options={{ title: "Rx", tabBarIcon: ({ color }) => <Feather name="clipboard" size={ICON_SIZE} color={color} /> }}
      />
      <Tabs.Screen
        name="lab"
        options={{ title: "Lab", tabBarIcon: ({ color }) => <Feather name="thermometer" size={ICON_SIZE} color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: "Profile", tabBarIcon: ({ color }) => <Feather name="user" size={ICON_SIZE} color={color} /> }}
      />
      <Tabs.Screen name="consultation-detail" options={{ href: null }} />
      <Tabs.Screen name="new-consultation" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="mental-buddy" options={{ href: null }} />
      <Tabs.Screen name="mental-buddy-chat" options={{ href: null }} />
      <Tabs.Screen name="hiv-aids" options={{ href: null }} />
      <Tabs.Screen name="lab-result" options={{ href: null }} />
    </TabLayout>
  );
}
