import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useListLabRequests, useUpdateLabRequestStatus, useUploadLabResult, getListLabRequestsQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { SCREEN_IMAGES } from "@/constants/hospitalImages";
import ScreenHeader from "@/components/ScreenHeader";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", in_progress: "#3b82f6", completed: "#10b981", cancelled: "#ef4444",
};

export default function LabRequests() {
  const colors = useColors();
  const queryClient = useQueryClient();
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);
  const [resultText, setResultText] = useState("");

  const { data: requests, isLoading, refetch } = useListLabRequests(undefined, {
    query: { queryKey: getListLabRequestsQueryKey() }
  });
  const updateStatus = useUpdateLabRequestStatus();

  const actions = [
    { label: "Results", icon: "file-text" as any, color: "#7c3aed", onPress: () => router.push("/(lab)/results") },
    { label: "Refresh", icon: "refresh-cw" as any, color: colors.primary, onPress: () => refetch() },
  ];
  const uploadResult = useUploadLabResult();

  const handleStartTest = (id: number) => {
    updateStatus.mutate(
      { id, data: { status: "in_progress" } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListLabRequestsQueryKey() }) }
    );
  };

  const handleUploadResult = () => {
    if (!resultText.trim() || !selectedRequest) { Alert.alert("Required", "Enter test results"); return; }
    uploadResult.mutate(
      { data: { requestId: selectedRequest, results: resultText.trim() } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListLabRequestsQueryKey() });
          setShowResultModal(false); setResultText(""); setSelectedRequest(null);
        },
        onError: () => Alert.alert("Error", "Failed to upload result")
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        imageUri={SCREEN_IMAGES.lab.requests}
        title="Lab Requests"
      />
      <FlatList
        data={requests}
        keyExtractor={(item) => (item as any).id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 84, paddingTop: 8 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.patientName, { color: colors.foreground }]}>{(item as any).patient?.name ?? "Patient"}</Text>
                <Text style={[styles.testType, { color: colors.primary }]}>{(item as any).testType}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(item as any).status] + "20" }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[(item as any).status] }]}>
                  {(item as any).status?.replace(/_/g, " ")}
                </Text>
              </View>
            </View>
            {(item as any).notes && <Text style={[styles.notes, { color: colors.mutedForeground }]}>{(item as any).notes}</Text>}
            <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date((item as any).createdAt).toLocaleDateString()}</Text>
            <View style={styles.btnRow}>
              {(item as any).status === "pending" && (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
                  onPress={() => handleStartTest((item as any).id)}
                >
                  <Text style={[styles.btnText, { color: colors.primary }]}>Start Test</Text>
                </TouchableOpacity>
              )}
              {(item as any).status === "in_progress" && (
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                  onPress={() => { setSelectedRequest((item as any).id); setShowResultModal(true); }}
                >
                  <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Upload Results</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="activity" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No lab requests</Text>
          </View>
        }
      />

      <Modal visible={showResultModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.title, { color: colors.foreground }]}>Upload Results</Text>
            <TouchableOpacity onPress={() => setShowResultModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>Test Results</Text>
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="Enter full test results..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={8}
            value={resultText}
            onChangeText={setResultText}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            onPress={handleUploadResult}
            disabled={uploadResult.isPending}
          >
            <Text style={[styles.btnText, { color: colors.primaryForeground, fontSize: 16, fontWeight: "700" }]}>
              {uploadResult.isPending ? "Uploading..." : "Upload Results"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroHeader: { paddingHorizontal: 16, paddingBottom: 16, position: "relative", minHeight: 120, justifyContent: "flex-end" },
  headerImage: { opacity: 0.35, resizeMode: "cover" },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "transparent" },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", position: "relative", zIndex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  patientName: { fontSize: 15, fontWeight: "700" },
  testType: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  notes: { fontSize: 13 },
  date: { fontSize: 12 },
  btnRow: { flexDirection: "row", gap: 8 },
  btn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  btnText: { fontSize: 14, fontWeight: "600" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  textArea: { borderWidth: 1, borderRadius: 10, padding: 14, fontSize: 15, minHeight: 160 },
  submitBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 20 },
});
