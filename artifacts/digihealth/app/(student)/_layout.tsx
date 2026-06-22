import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="home">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="consultations">
        <Icon sf={{ default: "stethoscope", selected: "stethoscope" }} />
        <Label>Consult</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="prescriptions">
        <Icon sf={{ default: "pills", selected: "pills.fill" }} />
        <Label>Rx</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="lab">
        <Icon sf={{ default: "testtube.2", selected: "testtube.2" }} />
        <Label>Lab</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="house" tintColor={color} size={24} /> : <Feather name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="consultations"
        options={{
          title: "Consult",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="stethoscope" tintColor={color} size={24} /> : <Feather name="activity" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prescriptions"
        options={{
          title: "Rx",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="pills" tintColor={color} size={24} /> : <Feather name="plus-square" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: "Lab",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="testtube.2" tintColor={color} size={24} /> : <Feather name="thermometer" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) =>
            isIOS ? <SymbolView name="person" tintColor={color} size={24} /> : <Feather name="user" size={22} color={color} />,
        }}
      />
      
      {/* Hide these from tabs */}
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

export default function StudentTabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}