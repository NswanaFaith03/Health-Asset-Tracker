import React, { useState } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar, TextInput, ImageBackground, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useListConsultations, getListConsultationsQueryKey } from "@workspace/api-client-react";
import { FeatureActionGrid } from "@/components/FeatureActionGrid";
import { useColors } from "../../hooks/useColors";
import { SCREEN_IMAGES } from "@/constants/hospitalImages";

type FeatherName = React.ComponentProps<typeof Feather>["name"];

const STATUS: Record<string, { bg: string; text: string; label: string; icon: FeatherName }> = {
  submitted:    { bg: "#fef9c3", text: "#ca8a04", label: "Submitted",    icon: "send" },
  under_review: { bg: "#dbeafe", text: "#1d4ed8", label: "Under Review", icon: "eye" },
  assigned:     { bg: "#ede9fe", text: "#6d28d9", label: "Assigned",     icon: "user-check" },
  responded:    { bg: "#dcfce7", text: "#16a34a", label: "Responded",    icon: "check-circle" },
  closed:       { bg: "#f1f5f9", text: "#64748b", label: "Closed",       icon: "archive" },
};

const SEVERITY: Record<string, { color: string; label: string }> = {
  low:      { color: "#16a34a", label: "Low" },
  medium:   { color: "#ca8a04", label: "Medium" },
  high:     { color: "#ea580c", label: "High" },
  critical: { color: "#dc2626", label: "Critical" },
};

export default function DoctorConsultations() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [search, setSearch] = useState("");
  const { data: consultations = [], isLoading, refetch } = useListConsultations(undefined, {
    query: { queryKey: getListConsultationsQueryKey() },
  });

  const actions = [
    { label: "Queue", icon: "users" as FeatherName, color: "#0d9488", onPress: () => router.push("/(doctor)/queue") },
    { label: "Prescriptions", icon: "clipboard" as FeatherName, color: "#0369a1", onPress: () => router.push("/(doctor)/prescriptions") },
    { label: "Lab Requests", icon: "thermometer" as FeatherName, color: "#7c3aed", onPress: () => router.push("/(doctor)/lab-requests") },
  ];

  const filtered = (consultations as any[]).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.student?.name ?? "").toLowerCase().includes(q) ||
      (c.symptoms ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* ── Header ── */}
      <ImageBackground
        source={{ uri: SCREEN_IMAGES.doctor.consultations }}
        style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={[styles.title, { color: "#000000" }]}>Doctor Consultations</Text>
        <Text style={[styles.subtitle, { color: \"#666666\" }]}>
          {(consultations as any[]).length} total · {(consultations as any[]).filter((c: any) => c.status === "submitted" || c.status === "under_review").length} pending
        </Text>
      </ImageBackground>

      <View style={[styles.header, { paddingTop: 12, backgroundColor: colors.background }]}>

        {/* Search */}
        <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search patients or symptoms…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Feather name="x" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FeatureActionGrid actions={actions} />

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 90, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
          renderItem={({ item }) => {
            const st = STATUS[(item as any).status] ?? STATUS.submitted;
            const sev = SEVERITY[(item as any).severity];
            return (
              <TouchableOpacity
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: sev?.color ?? colors.border, borderLeftWidth: 3 }]}
                onPress={() => router.push({ pathname: "/(doctor)/consultation-detail", params: { id: (item as any).id } })}
                activeOpacity={0.75}
              >
                <View style={styles.cardRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.patientName, { color: colors.foreground }]}>
                      {(item as any).student?.name ?? "Patient"}
                    </Text>
                    <Text style={[styles.symptoms, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {(item as any).symptoms}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Feather name={st.icon} size={11} color={st.text} />
                    <Text style={[styles.statusText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  {sev && (
                    <View style={[styles.sevPill, { backgroundColor: sev.color + "18" }]}>
                      <Text style={[styles.sevPillText, { color: sev.color }]}>{sev.label} severity</Text>
                    </View>
                  )}
                  <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                    {new Date((item as any).createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
                <Feather name="clipboard" size={32} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No consultations</Text>
              <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                {search ? "No results for your search" : "Patient consultations will appear here"}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroHeader: { paddingHorizontal: 16, paddingBottom: 16, position: "relative", minHeight: 140, justifyContent: "flex-end" },
  headerImage: { opacity: 0.35, resizeMode: "cover" },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: "800", marginBottom: 2, position: "relative", zIndex: 1, color: "#000000" },
  subtitle: { fontSize: 13, marginBottom: 14, position: "relative", zIndex: 1, color: "#666666" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, height: 42 },
  searchInput: { flex: 1, fontSize: 14 },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  cardRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  patientName: { fontSize: 15, fontWeight: "700", marginBottom: 3 },
  symptoms: { fontSize: 13, lineHeight: 18 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sevPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  sevPillText: { fontSize: 11, fontWeight: "600" },
  dateText: { fontSize: 12 },
  empty: { paddingTop: 60, alignItems: "center", gap: 10 },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: "700" },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 18 },
});
