/**
 * @module AAron-Nurse Portal
 * @file queue-management.tsx
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, ImageBackground, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useGetQueue, useJoinQueue, getGetQueueQueryKey, customFetch } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { AnimatedButton } from "../../components/AnimatedButton";
import { SCREEN_IMAGES } from "@/constants/hospitalImages";

type QueueFilter = "waiting" | "completed" | "all";

export default function NurseQueueManagement() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [studentId, setStudentId] = useState("");
  const [consultationId, setConsultationId] = useState("");
  const [temperature, setTemperature] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [oxygenSaturation, setOxygenSaturation] = useState("");
  const [weight, setWeight] = useState("");
  const [statusFilter, setStatusFilter] = useState<QueueFilter>("waiting");
  const [queue, setQueue] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    try {
      setIsLoading(true);
      const path = `/api/queue${statusFilter === "all" ? "?status=all" : `?status=${statusFilter}`}`;
      const data = await customFetch(path);
      setQueue(Array.isArray(data) ? data : []);
    } catch (error) {
      setQueue([]);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const joinQueue = useJoinQueue();

  const handleAddToQueue = () => {
    if (!studentId.trim() || !consultationId.trim()) {
      Toast.warning("Please enter student ID and consultation ID");
      return;
    }

    joinQueue.mutate(
      {
        data: {
          consultationId: Number(consultationId),
          studentId: studentId.trim(),
        } as any,
      },
      {
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey() });
          await fetchQueue();
          setShowModal(false);
          setStudentId("");
          setConsultationId("");
          Toast.success("Student added to queue successfully");
        },
        onError: (err: any) => Toast.error(err?.data?.message || err?.message || "Failed to add student to queue"),
      }
    );
  };

  const openVitalsModal = (entry: any) => {
    setSelectedEntry(entry);
    const consultation = entry.consultation ?? {};
    setTemperature(consultation.temperature ?? "");
    setBloodPressure(consultation.bloodPressure ?? "");
    setHeartRate(consultation.heartRate ?? "");
    setRespiratoryRate(consultation.respiratoryRate ?? "");
    setOxygenSaturation(consultation.oxygenSaturation ?? "");
    setWeight(consultation.weight ?? "");
    setShowVitalsModal(true);
  };

  const handleSaveVitals = async () => {
    if (!selectedEntry?.consultation?.id) {
      Toast.error("Unable to save vitals. No consultation selected.");
      return;
    }

    try {
      await customFetch(`/api/consultations/${selectedEntry.consultation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temperature: temperature.trim() || undefined,
          bloodPressure: bloodPressure.trim() || undefined,
          heartRate: heartRate.trim() || undefined,
          respiratoryRate: respiratoryRate.trim() || undefined,
          oxygenSaturation: oxygenSaturation.trim() || undefined,
          weight: weight.trim() || undefined,
        }),
      });
      queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey() });
      await fetchQueue();
      setShowVitalsModal(false);
      Toast.success("Vitals saved successfully");
    } catch (err: any) {
      Toast.error(err?.message || "Failed to save vitals");
    }
  };

  const handleClearCompleted = async () => {
    try {
      const result = await customFetch("/api/queue/clear-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }) as { cleared?: number; message?: string };
      await fetchQueue();
      setStatusFilter("waiting");
      Alert.alert("Queue cleared", result?.message ?? "Completed queue entries were removed.");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to clear completed queue entries");
    }
  };

  return (
    <>
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <ImageBackground
        source={{ uri: SCREEN_IMAGES.nurse.queue }}
        style={[styles.heroHeader, { paddingTop: insets.top + 16 }]}
        imageStyle={styles.headerImage}
      >
        <View style={styles.headerOverlay} />
        <View style={[styles.headerContent, { position: "relative", zIndex: 1 }]}> 
          <Text style={[styles.title, { color: "#000000" }]}>Queue Management</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowModal(true)}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.filterRow}>
        {(["waiting", "completed", "all"] as QueueFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterPill, { backgroundColor: statusFilter === filter ? colors.primary : colors.card, borderColor: statusFilter === filter ? colors.primary : colors.border }]}
            onPress={() => setStatusFilter(filter)}
          >
            <Text style={[styles.filterText, { color: statusFilter === filter ? colors.primaryForeground : colors.foreground }]}> 
              {filter === "all" ? "All" : filter === "waiting" ? "Waiting" : "Completed"}
            </Text>
          </TouchableOpacity>
        ))}
        {statusFilter === "completed" && (
          <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.muted }]} onPress={handleClearCompleted}>
            <Feather name="trash-2" size={15} color={colors.foreground} />
            <Text style={[styles.clearText, { color: colors.foreground }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={queue ?? []}
          keyExtractor={(item) => String((item as any).id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 84, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchQueue} />}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}> 
              <View style={styles.cardTop}>
                <View style={[styles.queueNumber, { backgroundColor: colors.primary }]}> 
                  <Text style={[styles.queueNumberText, { color: colors.primaryForeground }]}> 
                    {(item as any).queueNumber}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.studentName, { color: colors.foreground }]}> 
                    {(item as any).student?.name ?? "Student"}
                  </Text>
                  <Text style={[styles.studentNumber, { color: colors.mutedForeground }]}> 
                    {(item as any).student?.studentNumber ?? "No number"}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: (item as any).status === "completed" ? "#6b728020" : "#10b98120" }]}> 
                  <Text style={[styles.statusText, { color: (item as any).status === "completed" ? "#6b7280" : "#10b981" }]}>
                    {(item as any).status === "waiting" ? "Physical" : ((item as any).status ?? "Physical").replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.estimate, { color: colors.mutedForeground }]}> 
                Est. wait: {(item as any).estimatedWaitMinutes ?? 0} mins
              </Text>
              {((item as any).status ?? "waiting") === "waiting" && (
                <TouchableOpacity
                  style={[styles.vitalsButton, { backgroundColor: colors.primary }]}
                  onPress={() => openVitalsModal(item)}
                >
                  <Text style={[styles.vitalsButtonText, { color: colors.primaryForeground }]}> 
                    {(item as any).consultation?.temperature || (item as any).consultation?.bloodPressure ? "Edit Vitals" : "Enter Vitals"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Feather name="users" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No students in queue</Text>
            </View>
          }
        />
      )}

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}> 
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Student to Queue</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Student ID</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="Enter student ID"
            placeholderTextColor={colors.mutedForeground}
            value={studentId}
            onChangeText={setStudentId}
            keyboardType="number-pad"
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Consultation ID</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="Enter consultation ID"
            placeholderTextColor={colors.mutedForeground}
            value={consultationId}
            onChangeText={setConsultationId}
            keyboardType="number-pad"
          />

          <AnimatedButton
            label="Add to Queue"
            onPress={handleAddToQueue}
            isLoading={joinQueue.isPending}
            disabled={!studentId || !consultationId}
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            textColor={colors.primaryForeground}
          />
        </View>
      </Modal>

      <Modal visible={showVitalsModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}> 
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Enter Student Vitals</Text>
            <TouchableOpacity onPress={() => setShowVitalsModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.label, { color: colors.foreground }]}>Temperature</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. 98.6°F"
            placeholderTextColor={colors.mutedForeground}
            value={temperature}
            onChangeText={setTemperature}
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Blood Pressure</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. 120/80"
            placeholderTextColor={colors.mutedForeground}
            value={bloodPressure}
            onChangeText={setBloodPressure}
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Heart Rate</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. 72 bpm"
            placeholderTextColor={colors.mutedForeground}
            value={heartRate}
            onChangeText={setHeartRate}
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Respiratory Rate</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. 16 breaths/min"
            placeholderTextColor={colors.mutedForeground}
            value={respiratoryRate}
            onChangeText={setRespiratoryRate}
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Oxygen Saturation</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. 98%"
            placeholderTextColor={colors.mutedForeground}
            value={oxygenSaturation}
            onChangeText={setOxygenSaturation}
          />

          <Text style={[styles.label, { color: colors.foreground, marginTop: 16 }]}>Weight</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. 60kg"
            placeholderTextColor={colors.mutedForeground}
            value={weight}
            onChangeText={setWeight}
          />

          <AnimatedButton
            label="Save Vitals"
            onPress={handleSaveVitals}
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
            textColor={colors.primaryForeground}
          />
        </View>
      </Modal>
      <ToastContainer position="top" />
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  heroHeader: { paddingHorizontal: 16, paddingBottom: 16 },
  headerImage: { resizeMode: "cover", opacity: 0.7 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(255,255,255,0.22)" },
  headerContent: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 24, fontWeight: "800" },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  filterRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, flexWrap: "wrap" },
  filterPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "700" },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999 },
  clearText: { fontSize: 12, fontWeight: "700" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  queueNumber: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center" },
  queueNumberText: { fontSize: 13, fontWeight: "800" },
  studentName: { fontSize: 15, fontWeight: "700" },
  studentNumber: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  estimate: { fontSize: 12 },
  vitalsButton: { height: 42, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  vitalsButtonText: { fontSize: 14, fontWeight: "700" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16, fontWeight: "600" },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, height: 48, paddingHorizontal: 14, fontSize: 15 },
  submitBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 24 },
});
