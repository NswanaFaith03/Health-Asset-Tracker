import React from "react";
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { useAuth } from "../../contexts/AuthContext";
import { router } from "expo-router";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const FEATURES: { label: string; desc: string; icon: FeatherName; route: string; color: string }[] = [
  { label: "New Consultation",  desc: "Request a doctor appointment",  icon: "plus-circle",  route: "/(student)/new-consultation", color: "#0f766e" },
  { label: "My Consultations",  desc: "View your consultation history", icon: "activity",    route: "/(student)/consultations",    color: "#0d9488" },
  { label: "Prescriptions",     desc: "Track your medications",         icon: "clipboard",   route: "/(student)/prescriptions",    color: "#0369a1" },
  { label: "Lab Results",       desc: "View test results",              icon: "thermometer", route: "/(student)/lab",              color: "#7c3aed" },
  { label: "Mental Buddy",      desc: "AI mental health chat",          icon: "smile",       route: "/(student)/mental-buddy",     color: "#db2777" },
  { label: "HIV/AIDS Support",  desc: "Resources and education",        icon: "shield",      route: "/(student)/hiv-aids",         color: "#d97706" },
  { label: "Notifications",     desc: "Alerts and reminders",           icon: "bell",        route: "/(student)/notifications",    color: "#059669" },
];

export default function StudentHome() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user } = useAuth();

  const { data: dashboard, isLoading, refetch } = useGetStudentDashboard({
    query: { queryKey: getGetStudentDashboardQueryKey() },
  });

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const stats = [
    { label: "Consultations",   value: dashboard?.activeConsultations ?? 0,   icon: "activity" as FeatherName,    color: "#0f766e" },
    { label: "Notifications",   value: dashboard?.unreadNotifications ?? 0,    icon: "bell" as FeatherName,        color: "#d97706" },
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
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: insets.top + 20 }]}>
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

        {/* Queue banner */}
        {dashboard?.queuePosition && (
          <View style={styles.queueBanner}>
            <View style={styles.queueLeft}>
              <Feather name="clock" size={16} color={colors.primary} />
              <Text style={[styles.queueLabel, { color: colors.primary }]}>Queue Position</Text>
            </View>
            <Text style={[styles.queuePos, { color: colors.primary }]}>
              #{dashboard.queuePosition.position} of {dashboard.queuePosition.totalInQueue}
              {dashboard.queuePosition.estimatedWaitMinutes
                ? `  •  ~${dashboard.queuePosition.estimatedWaitMinutes} min`
                : ""}
            </Text>
          </View>
        )}
      </View>

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

        {/* ── Feature grid ── */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Health Services</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <TouchableOpacity
              key={f.label}
              style={[styles.featureCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(f.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.featureIcon, { backgroundColor: f.color + "18" }]}>
                <Feather name={f.icon} size={22} color={f.color} />
              </View>
              <Text style={[styles.featureLabel, { color: colors.foreground }]}>{f.label}</Text>
              <Text style={[styles.featureDesc, { color: colors.mutedForeground }]}>{f.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  greetingSmall: { color: "rgba(255,255,255,0.75)", fontSize: 13, marginBottom: 2 },
  greetingName: { color: "#fff", fontSize: 24, fontWeight: "800" },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -2, right: -2, backgroundColor: "#ef4444", borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  queueBanner: { backgroundColor: "#fff", borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  queueLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  queueLabel: { fontWeight: "600", fontSize: 13 },
  queuePos: { fontWeight: "700", fontSize: 13 },
  body: { paddingHorizontal: 16, paddingTop: 20 },
  statsRow: { gap: 12, paddingBottom: 4, paddingRight: 4 },
  statCard: { width: 100, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "center", gap: 6 },
  statIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginTop: 24, marginBottom: 14 },
  featureGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  featureCard: { width: "47%", padding: 16, borderRadius: 14, borderWidth: 1, gap: 8 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 14, fontWeight: "700", lineHeight: 18 },
  featureDesc: { fontSize: 11, lineHeight: 15 },
});
