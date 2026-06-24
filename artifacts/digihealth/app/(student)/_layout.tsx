import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { BlurView } from "expo-blur";
import { useColorScheme } from "react-native";

const ICON_SIZE = 22;

export default function StudentTabLayout() {
  const colors = useColors();
  const isDark = useColorScheme() === "dark";
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: 2 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: "Home", tabBarIcon: ({ color }) => <Feather name="home" size={ICON_SIZE} color={color} /> }}
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
    </Tabs>
  );
}
