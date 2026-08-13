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
  { label: "New Consultation",  icon: "plus-circle",  route: "/(student)/new-consultation", color: "#0f766e" },
  { label: "Queue",             icon: "users",        route: "/(student)/queue",            color: "#0d9488" },
  { label: "Prescriptions",     icon: "clipboard",   route: "/(student)/prescriptions",    color: "#0369a1" },
  { label: "Lab Results",       icon: "thermometer", route: "/(student)/lab",              color: "#7c3aed" },
  { label: "Mental Buddy",      icon: "smile",       route: "/(student)/mental-buddy",     color: "#db2777" },
  { label: "HIV/AIDS Support",  icon: "shield",      route: "/(student)/hiv-aids",         color: "#d97706" },
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
    { label: "Consultations",   value: dashboard?.activeConsultations ?? 0,   icon: "activity" as FeatherName,    color: "#0f766e" },
    { label: "Pending Rx",      value: dashboard?.pendingPrescriptions ?? 0,   icon: "clipboard" as FeatherName,   color: "#0369a1" },
    { label: "Lab Results",     value: dashboard?.pendingLabResults ?? 0,      icon: "thermometer" as FeatherName, color: "#7c3aed" },
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
        <View style={styles.headerOverlay} />
        <View style={styles.headerInner}>
          <View style={styles.headerRow}>
          <View>
            <Text style={styles.greetingSmall}>Good day 👋</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/(student)/notifications")}
          >
            <Feather name="bell" size={20} color="#fff" />
            {(dashboard?.unreadNotifications ?? 0) > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{dashboard!.unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Queue status */}
        {dashboard?.queuePosition && (
          <View style={[styles.queueBanner, { backgroundColor: colors.card, borderColor: colors.border }]}> 
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
      </ImageBackground>

      <View style={styles.body}>
        {/* ── Stats row ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
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
              style={[styles.featureButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(f.route as any)}
              activeOpacity={0.8}
            >
              <Feather name={f.icon} size={32} color={f.color} />
              <Text style={[styles.featureLabel, { color: colors.foreground }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.emergencySection, { backgroundColor: colors.secondary, borderColor: colors.border }]}> 
          <View style={styles.emergencyHeader}>
            <Feather name="phone-call" size={20} color={colors.accent} />
            <Text style={[styles.emergencyTitle, { color: colors.foreground }]}>Emergency Help</Text>
          </View>
          <Text style={[styles.emergencyText, { color: colors.mutedForeground }]}>If you are in danger or need urgent clinic help, the app will submit your current location before dialing.</Text>
          <TouchableOpacity
            style={[styles.emergencyButton, { backgroundColor: colors.accent }]}
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
  headerImage: { opacity: 0.35 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  headerInner: { position: "relative", zIndex: 1 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greetingSmall: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 2 },
  greetingName: { color: "#fff", fontSize: 24, fontWeight: "800" },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -2, right: -2, backgroundColor: "#ef4444", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  queueBanner: { borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", gap: 16, borderWidth: 1 },
  queueLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  queueLabel: { fontWeight: "600", fontSize: 13 },
  queuePos: { fontWeight: "700", fontSize: 16, marginTop: 4 },
  queueCircle: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  queueNumber: { fontSize: 22, fontWeight: "800" },
  queueDetails: { flex: 1 },
  queueInfo: { fontSize: 13, marginTop: 4 },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  statsRow: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  statCard: { width: 100, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginTop: 24, marginBottom: 14 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" },
  featureButton: { width: "48%", minHeight: 120, paddingVertical: 18, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  featureLabel: { fontSize: 13, fontWeight: "700", textAlign: "center", lineHeight: 18 },
  featureDesc: { fontSize: 11, lineHeight: 15 },
  emergencySection: { borderWidth: 1, borderRadius: 18, padding: 18, marginTop: 18 },
  emergencyHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  emergencyTitle: { fontSize: 16, fontWeight: "800" },
  emergencyText: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  emergencyButton: { alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 14, marginBottom: 10 },
  emergencyButtonText: { fontSize: 15, fontWeight: "700" },
  emergencyNote: { fontSize: 12, lineHeight: 16 },
});
