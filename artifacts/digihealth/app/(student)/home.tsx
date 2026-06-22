import React from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useGetStudentDashboard, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { router } from "expo-router";

export default function StudentHome() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const { data: dashboard, isLoading, refetch } = useGetStudentDashboard({
    query: { queryKey: getGetStudentDashboardQueryKey() }
  });

  const StatCard = ({ title, value, icon, route }: { title: string, value: number | string, icon: any, route: string }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => router.push(route as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.mutedForeground }]}>{title}</Text>
        <Feather name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={[styles.cardValue, { color: colors.foreground }]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: insets.bottom + 84, paddingHorizontal: 16 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.foreground }]}>Dashboard</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={{color: colors.mutedForeground}}>Loading your health summary...</Text>
        </View>
      ) : dashboard ? (
        <View style={styles.grid}>
          <StatCard 
            title="Active Consults" 
            value={dashboard.activeConsultations} 
            icon="activity" 
            route="/(student)/consultations"
          />
          <StatCard 
            title="Unread Alerts" 
            value={dashboard.unreadNotifications} 
            icon="bell" 
            route="/(student)/notifications"
          />
          <StatCard 
            title="Pending Rx" 
            value={dashboard.pendingPrescriptions} 
            icon="plus-square" 
            route="/(student)/prescriptions"
          />
          <StatCard 
            title="Lab Results" 
            value={dashboard.pendingLabResults} 
            icon="thermometer" 
            route="/(student)/lab"
          />
          {dashboard.queuePosition && (
             <View style={[styles.queueCard, { backgroundColor: colors.primary, borderRadius: colors.radius }]}>
                <Text style={{ color: colors.primaryForeground, fontWeight: "600", marginBottom: 4 }}>Current Queue Position</Text>
                <Text style={{ color: colors.primaryForeground, fontSize: 24, fontWeight: "bold" }}>
                  {dashboard.queuePosition.position} <Text style={{fontSize: 14}}>/ {dashboard.queuePosition.totalInQueue}</Text>
                </Text>
                {dashboard.queuePosition.estimatedWaitMinutes && (
                   <Text style={{ color: colors.primaryForeground, opacity: 0.8, marginTop: 4 }}>Est. wait: {dashboard.queuePosition.estimatedWaitMinutes} mins</Text>
                )}
             </View>
          )}
        </View>
      ) : (
        <Text style={{color: colors.foreground}}>No dashboard data available.</Text>
      )}

      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={() => router.push("/(student)/new-consultation")}
        >
          <Feather name="plus-circle" size={20} color={colors.primaryForeground} />
          <Text style={{ color: colors.primaryForeground, fontWeight: "600", marginLeft: 8 }}>New Consultation</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionBtnOutline, { borderColor: colors.primary, borderRadius: colors.radius }]}
          onPress={() => router.push("/(student)/mental-buddy")}
        >
          <Feather name="smile" size={20} color={colors.primary} />
          <Text style={{ color: colors.primary, fontWeight: "600", marginLeft: 8 }}>Mental Health Buddy</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: "bold" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  card: { width: "48%", padding: 16, borderWidth: 1, borderRadius: 12, marginBottom: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 13, fontWeight: "500" },
  cardValue: { fontSize: 24, fontWeight: "bold" },
  loadingContainer: { padding: 40, alignItems: "center" },
  queueCard: { width: "100%", padding: 20, marginTop: 8 },
  quickActions: { marginTop: 32, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16 },
  actionBtnOutline: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 16, borderWidth: 1 }
});