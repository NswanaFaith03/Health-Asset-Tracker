import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import { useColors } from "@/hooks/useColors";
import { BlurView } from "expo-blur";
import { useColorScheme } from "react-native";

export default function AdminTabLayout() {
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
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card }]} />
          ),
      }}
    >
      <Tabs.Screen name="analytics" options={{ title: "Analytics", tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" size={22} color={color} /> }} />
      <Tabs.Screen name="users" options={{ title: "Users", tabBarIcon: ({ color, size }) => <Feather name="users" size={22} color={color} /> }} />
      <Tabs.Screen name="audit" options={{ title: "Audit", tabBarIcon: ({ color, size }) => <Feather name="list" size={22} color={color} /> }} />
    </Tabs>
  );
}
