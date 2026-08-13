import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useGetQueue, useJoinQueue, getGetQueueQueryKey, customFetch } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { Toast, ToastContainer } from "../../components/Toast";
import { AnimatedButton } from "../../components/AnimatedButton";
import { SCREEN_IMAGES } from "@/constants/hospitalImages";

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

  const { data: queue, isLoading, refetch } = useGetQueue({
    query: { queryKey: getGetQueueQueryKey() },
  });

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
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey() });
          setShowModal(false);
          setStudentId("");
          setConsultationId("");
          Toast.success("Student added to queue successfully");
        },
        onError: (err: any) => Toast.error(err?.message || "Failed to add student to queue"),
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
      setShowVitalsModal(false);
      Toast.success("Vitals saved successfully");
    } catch (err: any) {
      Toast.error(err?.message || "Failed to save vitals");
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
          <Text style={[styles.title, { color: "#fff" }]}>Queue Management</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowModal(true)}
          >
            <Feather name="plus" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={[styles.header, { paddingTop: 12, paddingHorizontal: 16, paddingBottom: 12 }]}>
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
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
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
                <View style={[styles.statusBadge, { backgroundColor: "#10b98120" }]}> 
                  <Text style={[styles.statusText, { color: "#10b981" }]}> 
                    {(item as any).status === "waiting" ? "Physical" : ((item as any).status ?? "Physical").replace(/_/g, " ")}
                  </Text>
                </View>
              </View>
              <Text style={[styles.estimate, { color: colors.mutedForeground }]}>
                Est. wait: {(item as any).estimatedWaitMinutes} mins
              </Text>
              <TouchableOpacity
                style={[styles.vitalsButton, { backgroundColor: colors.primary }]}
                onPress={() => openVitalsModal(item)}
              >
                <Text style={[styles.vitalsButtonText, { color: colors.primaryForeground }]}>                {(item as any).consultation?.temperature || (item as any).consultation?.bloodPressure ? "Edit Vitals" : "Enter Vitals"}
                </Text>
              </TouchableOpacity>
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
            placeholder="e.g. 70 kg"
            placeholderTextColor={colors.mutedForeground}
            value={weight}
            onChangeText={setWeight}
          />

          <AnimatedButton
            label="Save Vitals"
            onPress={handleSaveVitals}
            isLoading={false}
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
  heroHeader: { paddingHorizontal: 16, paddingBottom: 16, position: "relative", minHeight: 120, justifyContent: "flex-end", flexDirection: "row", alignItems: "flex-end" },
  headerImage: { opacity: 0.35, resizeMode: "cover" },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(15, 118, 110, 0.65)" },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#fff" },
  addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10, gap: 8 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  queueNumber: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  queueNumberText: { fontSize: 16, fontWeight: "800" },
  studentName: { fontSize: 15, fontWeight: "700" },
  studentNumber: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: "700" },
  estimate: { fontSize: 12 },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80, gap: 12 },
  emptyText: { fontSize: 16 },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 10, height: 48, paddingHorizontal: 14, fontSize: 15 },
  submitBtn: { height: 52, justifyContent: "center", alignItems: "center", marginTop: 24 },
  vitalsButton: { marginTop: 12, borderRadius: 10, paddingVertical: 12, alignItems: "center" },
  vitalsButtonText: { fontSize: 14, fontWeight: "700" },
  submitText: { fontSize: 16, fontWeight: "700" },
});
