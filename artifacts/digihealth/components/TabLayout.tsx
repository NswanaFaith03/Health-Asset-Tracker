import { Tabs, Redirect } from "expo-router";
import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

type TabLayoutProps = {
  allowedRoles: string[];
  children: ReactNode;
  headerRight?: ReactNode;
};

export function TabLayout({ allowedRoles, children, headerRight }: TabLayoutProps) {
  const { currentUser, logout } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, backgroundColor: colors.background }]}> 
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}> 
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.foreground }]}>Hi, {currentUser.name?.split(" ")[0] ?? "there"}</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Signed in as {currentUser.role.replace(/_/g, " ")}</Text>
        </View>
        <View style={styles.headerActions}>
          {headerRight}
          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: colors.primary }]} onPress={() => logout().catch(() => {})}>
            <Feather name="log-out" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
        }}
      >
        {children}
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: "700", marginBottom: 2 },
  subtitle: { fontSize: 12, lineHeight: 18 },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
});
