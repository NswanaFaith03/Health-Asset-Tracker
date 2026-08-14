/**
 * Student Home screen — Sprint 7 thin wrapper.
 *
 * Emergency call logic delegated to `useEmergency`.
 */
import React, { useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, StatusBar, ImageBackground, ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { useAuth } from "../../contexts/AuthContext";
import { useEmergency } from "../../features/emergency/useEmergency";
import { router } from "expo-router";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const FEATURES: { label: string; icon: FeatherName; route: string; color: string }[] = [
  { label: "New Consultation",  icon: "plus-circle",  route: "/(student)/new-consultation", color: "#10b981" },
  { label: "Queue",             icon: "users",        route: "/(student)/queue",            color: "#059669" },
  { label: "Prescriptions",     icon: "clipboard",   route: "/(student)/prescriptions",    color: "#0891b2" },
  { label: "Lab Results",       icon: "thermometer", route: "/(student)/lab",              color: "#14b8a6" },
  { label: "Mental Buddy",      icon: "smile",       route: "/(student)/mental-buddy",     color: "#ec4899" },
  { label: "HIV/AIDS Support",  icon: "shield",      route: "/(student)/hiv-aids",         color: "#f97316" },
];

export default function StudentHome() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser } = useAuth();
  const { isLoadingNumber, isCalling, handleEmergencyCall } = useEmergency();

  const { data: dashboard, isLoading, refetch } = useGetStudentDashboard({
    query: { queryKey: getGetStudentDashboardQueryKey() },
  });

  const firstName = currentUser?.name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Consultations",   value: dashboard?.activeConsultations ?? 0,   icon: "activity" as FeatherName,    color: "#10b981" },
    { label: "Pending Rx",      value: dashboard?.pendingPrescriptions ?? 0,   icon: "clipboard" as FeatherName,   color: "#0891b2" },
    { label: "Lab Results",     value: dashboard?.pendingLabResults ?? 0,      icon: "thermometer" as FeatherName, color: "#14b8a6" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* ── Header ── */}
      <ImageBackground
        source={require("../../assets/images/school.jpg")}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerInner}>
          <View style={styles.headerContentCard}>
            <View style={styles.headerRow}>
            <View>
              <Text style={styles.greetingSmall}>Good day 👋</Text>
              <Text style={styles.greetingName}>{firstName}</Text>
            </View>
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={() => router.push("/(student)/notifications")}
            >
              <Feather name="bell" size={20} color="#10b981" />
              {(dashboard?.unreadNotifications ?? 0) > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{dashboard!.unreadNotifications}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Queue status */}
          {dashboard?.queuePosition && (
            <View style={[styles.queueBanner, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }]}> 
              <View style={[styles.queueCircle, { borderColor: colors.primary }]}> 
                <Text style={[styles.queueNumber, { color: colors.primary }]}>{dashboard.queuePosition.queueNumber}</Text>
              </View>
              <View style={styles.queueDetails}>
                <Text style={[styles.queueLabel, { color: colors.foreground }]}>Your queue spot</Text>
                <Text style={[styles.queuePos, { color: colors.foreground }]}>#{dashboard.queuePosition.position} of {dashboard.queuePosition.totalInQueue}</Text>
                {dashboard.queuePosition.estimatedWaitMinutes ? (
                  <Text style={[styles.queueInfo, { color: colors.mutedForeground }]}>~{dashboard.queuePosition.estimatedWaitMinutes} min wait</Text>
                ) : (
                  <Text style={[styles.queueInfo, { color: colors.mutedForeground }]}>Waiting for doctor availability</Text>
                )}
              </View>
            </View>
          )}
          </View>
        </View>
      </ImageBackground>

      <View style={styles.body}>
        {/* ── Stats row ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: s.color, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "20" }]}>
                <Feather name={s.icon} size={18} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ── Feature buttons ── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Health Services</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={[styles.featureButton, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: f.color, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6 }]}
              onPress={() => router.push(f.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconWrapper, { backgroundColor: f.color + "15" }]}>
                <Feather name={f.icon} size={32} color={f.color} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.foreground }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.emergencySection, { backgroundColor: colors.secondary, borderColor: colors.border, shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }]}> 
          <View style={styles.emergencyHeader}>
            <Feather name="phone-call" size={20} color={colors.accent} />
            <Text style={[styles.emergencyTitle, { color: colors.foreground }]}>Emergency Help</Text>
          </View>
          <Text style={[styles.emergencyText, { color: colors.mutedForeground }]}>If you are in danger or need urgent clinic help, the app will submit your current location before dialing.</Text>
          <TouchableOpacity
            style={[styles.emergencyButton, { backgroundColor: colors.accent, shadowColor: colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }]}
            onPress={handleEmergencyCall}
            disabled={isCalling || isLoadingNumber}
          >
            {isCalling ? (
              <ActivityIndicator color={colors.accentForeground} />
            ) : (
              <Text style={[styles.emergencyButtonText, { color: colors.accentForeground }]}>Call Emergency</Text>
            )}
          </TouchableOpacity>
          <Text style={[styles.emergencyNote, { color: colors.mutedForeground }]}>Number loaded from admin settings.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24, position: "relative" },
  headerImage: { opacity: 1 },
  headerInner: { position: "relative", zIndex: 1 },
  headerContentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greetingSmall: { color: "#000000", fontSize: 14, marginBottom: 2, fontWeight: "600" },
  greetingName: { color: "#000000", fontSize: 26, fontWeight: "800" },
  notifBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 4 },
  badge: { position: "absolute", top: -2, right: -2, backgroundColor: "#ef4444", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, shadowColor: "#ef4444", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  queueBanner: { borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 16, borderWidth: 1 },
  queueLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  queueLabel: { fontWeight: "600", fontSize: 14 },
  queuePos: { fontWeight: "700", fontSize: 17, marginTop: 4 },
  queueCircle: { width: 72, height: 72, borderRadius: 36, borderWidth: 2.5, alignItems: "center", justifyContent: "center" },
  queueNumber: { fontSize: 24, fontWeight: "800" },
  queueDetails: { flex: 1 },
  queueInfo: { fontSize: 13, marginTop: 4 },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  statsRow: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  statCard: { width: 105, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: "center", gap: 8 },
  statIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 24, fontWeight: "800" },
  statLabel: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "800", marginTop: 28, marginBottom: 16 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  featureButton: { width: "48%", minHeight: 130, paddingVertical: 20, borderRadius: 20, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  featureIconWrapper: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  featureLabel: { fontSize: 14, fontWeight: "700", textAlign: "center", lineHeight: 18 },
  featureDesc: { fontSize: 11, lineHeight: 15 },
  emergencySection: { borderWidth: 1, borderRadius: 20, padding: 20, marginTop: 24 },
  emergencyHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  emergencyTitle: { fontSize: 17, fontWeight: "800" },
  emergencyText: { fontSize: 14, lineHeight: 20, marginBottom: 16 },
  emergencyButton: { alignItems: "center", justifyContent: "center", borderRadius: 16, paddingVertical: 16, marginBottom: 10 },
  emergencyButtonText: { fontSize: 16, fontWeight: "700" },
  emergencyNote: { fontSize: 12, lineHeight: 16 },
});
