import React from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useListUsers, useUpdateUserStatus, getListUsersQueryKey, customFetch } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const ROLE_COLORS: Record<string, string> = {
  student: "#3b82f6", doctor: "#10b981", pharmacist: "#8b5cf6",
  lab_technician: "#f59e0b", mental_health_counselor: "#ec4899",
  hiv_professional: "#ef4444", admin: "#6b7280",
};

const STAFF_ROLES = ["doctor", "pharmacist", "lab_technician", "mental_health_counselor", "hiv_professional", "admin"] as const;
type StaffRole = (typeof STAFF_ROLES)[number];

export default function AdminUsers() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = React.useState(false);
  const [filter, setFilter] = React.useState<"all" | "pending" | "student" | "staff">("all");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<StaffRole>("doctor");
  const [creating, setCreating] = React.useState(false);

  const { data: users, isLoading, refetch } = useListUsers(undefined, { query: { queryKey: getListUsersQueryKey() } });
  const updateStatus = useUpdateUserStatus();

  const pendingCount = (users ?? []).filter((u: any) => u.status === "pending").length;

  const filteredUsers = (users ?? []).filter((u: any) => {
    if (filter === "pending") return u.status === "pending";
    if (filter === "student") return u.role === "student";
    if (filter === "staff") return u.role !== "student";
    return true;
  });

  const handleCreateUser = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) { Alert.alert("Required", "All fields required."); return; }
    setCreating(true);
    try {
      await customFetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }) });
      setName(""); setEmail(""); setPassword(""); setRole("doctor");
      setShowCreate(false);
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      Alert.alert("Created", "Staff account created.");
    } catch (e: any) { Alert.alert("Failed", e?.message || "Could not create user"); }
    finally { setCreating(false); }
  };

  const handleStatusTap = (id: number, status: string, uname: string) => {
    if (status === "pending") {
      Alert.alert("Approve Account", `Approve ${uname}'s student account?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Approve ✓", onPress: () => updateStatus.mutate({ id, data: { status: "active" as any } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }) }) },
      ]);
    } else {
      const next = status === "active" ? "suspended" : "active";
      Alert.alert("Change Status", `Set ${uname} to ${next}?`, [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => updateStatus.mutate({ id, data: { status: next as any } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() }) }) },
      ]);
    }
  };

  const STATUS_MAP: Record<string, { bg: string; fg: string; label: string }> = {
    active: { bg: "#10b98115", fg: "#10b981", label: "Active" },
    pending: { bg: "#f59e0b15", fg: "#f59e0b", label: "Pending ▸ Approve" },
    suspended: { bg: "#ef444415", fg: "#ef4444", label: "Suspended" },
  };

  const FILTERS = [
    { k: "all", l: "All" }, { k: "pending", l: `Pending${pendingCount ? ` (${pendingCount})` : ""}` },
    { k: "student", l: "Students" }, { k: "staff", l: "Staff" },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Users</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>{(users ?? []).length} total · {pendingCount} pending</Text>
        </View>
        <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]} onPress={() => setShowCreate(true)}>
          <Feather name="user-plus" size={16} color={colors.primaryForeground} />
          <Text style={[styles.createBtnText, { color: colors.primaryForeground }]}>New Staff</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f.k} onPress={() => setFilter(f.k as any)}
            style={[styles.filterTab, { backgroundColor: filter === f.k ? colors.primary : colors.card, borderColor: filter === f.k ? colors.primary : colors.border }]}>
            <Text style={{ fontSize: 13, fontWeight: "700", color: filter === f.k ? colors.primaryForeground : colors.mutedForeground }}>{f.l}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => {
            const s = (item as any).status as string;
            const sc = STATUS_MAP[s] ?? STATUS_MAP.active;
            return (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: s === "pending" ? "#f59e0b60" : colors.border, borderWidth: s === "pending" ? 1.5 : 1 }]}>
                {s === "pending" && (
                  <View style={styles.pendingBanner}>
                    <Feather name="clock" size={11} color="#f59e0b" />
                    <Text style={styles.pendingText}>Awaiting admin approval</Text>
                  </View>
                )}
                <View style={styles.cardRow}>
                  <View style={[styles.avatar, { backgroundColor: ROLE_COLORS[(item as any).role] + "20" }]}>
                    <Text style={[styles.avatarText, { color: ROLE_COLORS[(item as any).role] }]}>{(item as any).name?.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={[styles.uname, { color: colors.foreground }]}>{(item as any).name}</Text>
                    <Text style={[styles.uemail, { color: colors.mutedForeground }]}>{(item as any).email}</Text>
                    {(item as any).studentNumber && <Text style={[styles.ustnum, { color: colors.mutedForeground }]}>#{(item as any).studentNumber}</Text>}
                    <View style={[styles.roleBadge, { backgroundColor: ROLE_COLORS[(item as any).role] + "20" }]}>
                      <Text style={[styles.roleText, { color: ROLE_COLORS[(item as any).role] }]}>{(item as any).role?.replace(/_/g, " ")}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={[styles.statusBtn, { backgroundColor: sc.bg }]} onPress={() => handleStatusTap((item as any).id, s, (item as any).name)}>
                    <Text style={{ fontSize: 11, fontWeight: "700", color: sc.fg, textAlign: "center" }}>{sc.label}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>{filter === "pending" ? "No pending approvals" : "No users found"}</Text>
            </View>
          }
        />
      )}

      <Modal visible={showCreate} animationType="slide" transparent onRequestClose={() => setShowCreate(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.background }]}>
            <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.foreground }]}>Create Staff Account</Text>
                <TouchableOpacity onPress={() => setShowCreate(false)}><Feather name="x" size={22} color={colors.foreground} /></TouchableOpacity>
              </View>
              <Text style={[styles.modalNote, { color: colors.mutedForeground }]}>Staff are active immediately. Students self-register and need approval.</Text>

              {[{ l: "Full Name", v: name, s: setName, kbt: "default" as const, cap: "words" as const, sec: false },
                { l: "Email", v: email, s: setEmail, kbt: "email-address" as const, cap: "none" as const, sec: false },
                { l: "Password", v: password, s: setPassword, kbt: "default" as const, cap: "none" as const, sec: true }].map((f) => (
                <View key={f.l}>
                  <Text style={[styles.label, { color: colors.foreground }]}>{f.l}</Text>
                  <TextInput style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} value={f.v} onChangeText={f.s} autoCapitalize={f.cap} keyboardType={f.kbt} secureTextEntry={f.sec} />
                </View>
              ))}

              <Text style={[styles.label, { color: colors.foreground }]}>Role</Text>
              <View style={styles.roleWrap}>
                {STAFF_ROLES.map((r) => (
                  <TouchableOpacity key={r} onPress={() => setRole(r)} style={[styles.rolePill, { backgroundColor: role === r ? colors.primary : colors.card, borderColor: colors.border }]}>
                    <Text style={{ color: role === r ? colors.primaryForeground : colors.foreground, fontSize: 12, fontWeight: "600" }}>{r.replace(/_/g, " ")}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: creating ? 0.75 : 1 }]} onPress={handleCreateUser} disabled={creating}>
                {creating ? <ActivityIndicator color={colors.primaryForeground} /> : <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Create Account</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: "700" },
  sub: { fontSize: 13, marginTop: 2 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  createBtnText: { fontSize: 13, fontWeight: "700" },
  filterRow: { paddingHorizontal: 16, paddingBottom: 10, gap: 8 },
  filterTab: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, marginBottom: 10, overflow: "hidden" },
  cardRow: { flexDirection: "row", alignItems: "center", padding: 12 },
  pendingBanner: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: "#f59e0b15" },
  pendingText: { fontSize: 12, fontWeight: "600", color: "#f59e0b" },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { fontSize: 18, fontWeight: "700" },
  uname: { fontSize: 15, fontWeight: "700" },
  uemail: { fontSize: 12, marginTop: 1 },
  ustnum: { fontSize: 11, marginTop: 1 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, alignSelf: "flex-start", marginTop: 4 },
  roleText: { fontSize: 11, fontWeight: "600" },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, alignItems: "center", minWidth: 80 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalCard: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: "88%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalNote: { fontSize: 13, marginBottom: 12, lineHeight: 18 },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  roleWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  rolePill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  submitBtn: { marginTop: 16, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 15, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
});
