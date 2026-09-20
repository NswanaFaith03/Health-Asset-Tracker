import React from "react";
import { View, StyleSheet, Platform, TouchableOpacity, Text, ViewStyle, TextStyle, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";

interface WebAppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
}

export function WebAppLayout({ children, title, showNavigation = true }: WebAppLayoutProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentUser, logout } = useAuth();

  if (Platform.OS !== "web") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", icon: "home" },
    { label: "Patients", icon: "users" },
    { label: "Consultations", icon: "clipboard" },
    { label: "Queue", icon: "activity" },
  ];

  return (
    <View style={[styles.shell, { backgroundColor: colors.background }]}>
      <ImageBackground 
        source={require("../assets/images/doctor.jpg")}
        style={styles.backgroundImage}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.backgroundOverlay} />
        <View style={[styles.orb, styles.orbOne]} />
        <View style={[styles.orb, styles.orbTwo]} />

        <View style={[styles.header, { backgroundColor: "rgba(255, 255, 255, 0.95)", borderBottomColor: colors.border }]}>
          <View style={styles.headerInner}>
            <View style={styles.brandWrap}>
              <View style={[styles.logoContainer, { backgroundColor: "rgba(8, 145, 178, 0.1)" }]}>
                <Feather name="activity" size={24} color={colors.primary} />
              </View>
              <View style={styles.branding}>
                <Text style={[styles.logo, { color: colors.foreground }]}>UNZA DigiHealth</Text>
                <Text style={[styles.tagline, { color: colors.mutedForeground }]}>Healthcare Management System</Text>
              </View>
            </View>

            {showNavigation && (
              <View style={styles.navigation}>
                {navItems.map((item) => (
                  <TouchableOpacity key={item.label} style={[styles.navItem, { backgroundColor: item.label === "Dashboard" ? "rgba(8, 145, 178, 0.08)" : "transparent", borderColor: item.label === "Dashboard" ? colors.primary : "transparent" }]}>
                    <Feather name={item.icon as any} size={16} color={item.label === "Dashboard" ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.navText, { color: item.label === "Dashboard" ? colors.foreground : colors.mutedForeground }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.headerRight}>
              <View style={[styles.userInfo, { backgroundColor: "rgba(248, 250, 252, 0.8)", borderColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: "rgba(8, 145, 178, 0.1)" }]}>
                  <Feather name="user" size={20} color={colors.primary} />
                </View>
                <View style={styles.userDetails}>
                  <Text style={[styles.userName, { color: colors.foreground }]}>
                    {currentUser?.name?.split(" ")[0] || "User"}
                  </Text>
                  <Text style={[styles.userRole, { color: colors.mutedForeground }]}>
                    {currentUser?.role || "Student"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.primary }]} onPress={() => logout()}>
                <Feather name="log-out" size={16} color={colors.primaryForeground} />
                <Text style={[styles.logoutText, { color: colors.primaryForeground }]}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.content, { paddingTop: insets.top + 100, paddingBottom: insets.bottom + 32 }]}>
          {title && (
            <View style={styles.pageHeader}>
              <Text style={[styles.pageKicker, { color: colors.primary }]}>Wellness platform</Text>
              <Text style={[styles.pageTitle, { color: colors.foreground }]}>{title}</Text>
              <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
                Manage your healthcare activities efficiently and keep care moving forward.
              </Text>
            </View>
          )}
          <View style={[styles.innerPanel, { backgroundColor: "rgba(255, 255, 255, 0.92)", borderColor: colors.border }]}>{children}</View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    minHeight: "100%",
    position: "relative",
    overflow: "hidden",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  backgroundImageStyle: {
    opacity: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(6, 27, 24, 0.85)",
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.12,
    filter: "blur(60px)",
  },
  orbOne: {
    width: 400,
    height: 400,
    top: -100,
    left: -100,
    backgroundColor: "#0891b2",
  },
  orbTwo: {
    width: 500,
    height: 500,
    right: -100,
    bottom: -150,
    backgroundColor: "#0ea5e9",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    borderBottomWidth: 1,
    backdropFilter: "blur(12px)",
  },
  headerInner: {
    maxWidth: 1400,
    width: "100%",
    marginHorizontal: "auto",
    paddingHorizontal: 32,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  brandWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  logoContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(8, 145, 178, 0.2)",
  },
  branding: {
    gap: 3,
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.08,
    textTransform: "uppercase",
  },
  navigation: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  navText: {
    fontSize: 14,
    fontWeight: "600",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  userDetails: {
    alignItems: "flex-start",
  },
  userName: {
    fontSize: 15,
    fontWeight: "700",
  },
  userRole: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    maxWidth: 1400,
    width: "100%",
    marginHorizontal: "auto",
    paddingHorizontal: 32,
  },
  pageHeader: {
    marginBottom: 28,
  },
  pageKicker: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.14,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 10,
  },
  pageSubtitle: {
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 720,
  },
  innerPanel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 28,
  },
});