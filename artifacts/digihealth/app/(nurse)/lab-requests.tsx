import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useListLabRequests, useUpdateLabRequestStatus, getListLabRequestsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { AnimatedButton } from "../../components/AnimatedButton";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  in_progress: "#3b82f6",
  awaiting_results: "#8b5cf6",
  completed: "#10b981",
  cancelled: "#ef4444",
};

export default function NurseLabRequests() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  const { data: requests, isLoading, refetch } = useListLabRequests({});

  const updateStatus = useUpdateLabRequestStatus();

  const handleUpdateStatus = (request: any, status: string) => {
    Toast.info(`Updating status to ${status.replace(/_/g, " ")}...`);
    updateStatus.mutate(
      { id: request.id, data: { status: status as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLabRequestsQueryKey() });
          Toast.success("Status updated successfully");
          setShowModal(false);
          setSelectedRequest(null);
          setNewStatus("");
        },
        onError: (err: any) => {
          Toast.error(err?.message || "Failed to update status");
        }
      }
    );
  };

  return (
    <>
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={require("../../assets/images/nursing_students.jpg")}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <Text style={[styles.title, { color: "#000000" }]}>Lab Requests</Text>
        <TouchableOpacity onPress={() => refetch()}>
          <Feather name="refresh-cw" size={20} color="#111827" />
        </TouchableOpacity>
      </ImageBackground>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={requests ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                setSelectedRequest(item);
                setShowModal(true);
              }}
            >
              <View style={styles.cardTop}>
                <View style={[styles.iconWrap, { backgroundColor: "#f59e0b15" }]}>
                  <Feather name="clipboard" size={18} color="#f59e0b" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.testType, { color: colors.foreground }]}>{(item as any).testType}</Text>
                  <Text style={[styles.patient, { color: colors.mutedForeground }]}>
                    {(item as any).patient?.name ?? "Patient"}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: STATUS_COLORS[(item as any).status] + "20" },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>
                    {(item as any).status}
                  </Text>
                </View>
              </View>
              <Text style={[styles.date, { color: colors.mutedForeground }]}>
                {new Date((item as any).createdAt).toLocaleDateString()}
              </Text>
              {(item as any).notes && (
                <Text style={[styles.notes, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {(item as any).notes}
                </Text>
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="inbox" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No lab requests</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        {selectedRequest && (
          <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Update Status</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Feather name="x" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            <View style={styles.detail}>
              <Text style={[styles.label, { color: colors.foreground }]}>Test Type</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>{selectedRequest.testType}</Text>
            </View>

            <View style={styles.detail}>
              <Text style={[styles.label, { color: colors.foreground }]}>Patient</Text>
              <Text style={[styles.value, { color: colors.foreground }]}>
                {selectedRequest.patient?.name ?? "Unknown"}
              </Text>
            </View>

            <View style={styles.detail}>
              <Text style={[styles.label, { color: colors.foreground }]}>Current Status</Text>
              <Text style={[styles.value, { color: STATUS_COLORS[selectedRequest.status] }]}>
                {selectedRequest.status}
              </Text>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground, marginTop: 24 }]}>
              Update Status To
            </Text>

            {["pending", "in_progress", "awaiting_results", "completed", "cancelled"].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusBtn,
                  {
                    backgroundColor: status === newStatus ? colors.primary : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setNewStatus(status)}
              >
                <Text
                  style={[
                    styles.statusBtnText,
                    { color: status === newStatus ? colors.primaryForeground : colors.foreground },
                  ]}
                >
                  {status.replace(/_/g, " ")}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              onPress={() => newStatus && handleUpdateStatus(selectedRequest, newStatus)}
            >
              <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Update</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
      <ToastContainer position="top" />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 16, paddingBottom: 16, position: "relative", backgroundColor: "transparent",
  },
  headerImage: { opacity: 0.32, resizeMode: "cover" },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  title: { fontSize: 24, fontWeight: "700", color: "#000000", zIndex: 2 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  testType: { fontSize: 15, fontWeight: "700" },
  patient: { fontSize: 13, marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  date: { fontSize: 12 },
  notes: { fontSize: 12, marginTop: 4 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  detail: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  value: { fontSize: 16, fontWeight: "600" },
  sectionLabel: { fontSize: 14, fontWeight: "600", marginBottom: 12 },
  statusBtn: { paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  statusBtnText: { fontSize: 15, fontWeight: "600", textTransform: "capitalize" },
  submitBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 24 },
  submitText: { fontSize: 16, fontWeight: "700" },
});
