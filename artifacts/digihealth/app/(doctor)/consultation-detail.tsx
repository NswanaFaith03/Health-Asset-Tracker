import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert, Modal, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useGetConsultation, useUpdateConsultation, useUpdateConsultationStatus, useCreatePrescription, useCreateLabRequest, getGetConsultationQueryKey, getListConsultationsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

const STATUS_COLORS: Record<string, string> = {
  submitted: "#f59e0b", under_review: "#3b82f6", assigned: "#8b5cf6", responded: "#10b981", closed: "#6b7280",
};
const SEVERITY_COLORS: Record<string, string> = {
  low: "#10b981", medium: "#f59e0b", high: "#f97316", critical: "#ef4444",
};

export default function DoctorConsultationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const consultationId = Number(id);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");
  const [testType, setTestType] = useState("");

  const { data: consultation, isLoading } = useGetConsultation(consultationId, {
    query: { enabled: !!consultationId, queryKey: getGetConsultationQueryKey(consultationId) }
  });
  const updateConsultation = useUpdateConsultation();
  const updateStatus = useUpdateConsultationStatus();
  const createPrescription = useCreatePrescription();
  const createLabRequest = useCreateLabRequest();

  const handleRespond = () => {
    if (!diagnosis.trim()) { Alert.alert("Required", "Enter a diagnosis"); return; }
    updateConsultation.mutate(
      { id: consultationId, data: { diagnosis: diagnosis.trim(), notes: notes.trim(), status: "responded" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetConsultationQueryKey(consultationId) });
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
          Alert.alert("Done", "Response submitted");
        }
      }
    );
  };

  const handleAssign = () => {
    updateStatus.mutate(
      { id: consultationId, data: { status: "assigned", doctorId: currentUser?.id } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetConsultationQueryKey(consultationId) }) }
    );
  };

  const handlePrescription = () => {
    if (!medication || !dosage || !instructions) { Alert.alert("Required", "Fill all fields"); return; }
    createPrescription.mutate(
      { data: { patientId: (consultation as any)?.studentId, consultationId, medication, dosage, instructions } },
      {
        onSuccess: () => { setShowPrescriptionModal(false); Alert.alert("Done", "Prescription issued"); },
        onError: () => Alert.alert("Error", "Failed to create prescription")
      }
    );
  };

  const handleLabRequest = () => {
    if (!testType) { Alert.alert("Required", "Enter test type"); return; }
    createLabRequest.mutate(
      { data: { patientId: (consultation as any)?.studentId, consultationId, testType } },
      {
        onSuccess: () => { setShowLabModal(false); Alert.alert("Done", "Lab request created"); },
        onError: () => Alert.alert("Error", "Failed to create lab request")
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Consultation</Text>
        <View style={{ width: 40 }} />
      </View>
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : !consultation ? (
        <View style={styles.center}><Text style={{ color: colors.mutedForeground }}>Not found</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.patientName, { color: colors.foreground }]}>{(consultation as any).student?.name ?? "Patient"}</Text>
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor: STATUS_COLORS[(consultation as any).status] + "20" }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLORS[(consultation as any).status] }]}>{(consultation as any).status?.replace(/_/g, " ")}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[(consultation as any).severity] + "20" }]}>
                <Text style={[styles.badgeText, { color: SEVERITY_COLORS[(consultation as any).severity] }]}>{(consultation as any).severity?.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Symptoms</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{(consultation as any).symptoms}</Text>
            {((consultation as any).attachments ?? []).length > 0 && (
              <View style={[styles.attachmentsSection, { borderColor: colors.border }]}> 
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Attached Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsRow}>
                  {((consultation as any).attachments ?? []).map((uri: string) => (
                    <Image key={uri} source={{ uri }} style={styles.attachmentPreview} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {(consultation as any).status === "submitted" && (
            <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]} onPress={handleAssign}>
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Accept & Assign to Me</Text>
            </TouchableOpacity>
          )}

          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Response</Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Diagnosis</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="Enter diagnosis..."
              placeholderTextColor={colors.mutedForeground}
              value={diagnosis || ((consultation as any).diagnosis ?? "")}
              onChangeText={setDiagnosis}
              multiline
            />
            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>Notes</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="Additional notes..."
              placeholderTextColor={colors.mutedForeground}
              value={notes || ((consultation as any).notes ?? "")}
              onChangeText={setNotes}
              multiline
            />
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius, marginTop: 12 }]}
              onPress={handleRespond}
            >
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Submit Response</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]} onPress={() => setShowPrescriptionModal(true)}>
              <Feather name="package" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Prescribe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]} onPress={() => setShowLabModal(true)}>
              <Feather name="activity" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Lab Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <Modal visible={showPrescriptionModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Issue Prescription</Text>
            <TouchableOpacity onPress={() => setShowPrescriptionModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          {[
            { label: "Medication", value: medication, setter: setMedication, placeholder: "e.g. Amoxicillin 500mg" },
            { label: "Dosage", value: dosage, setter: setDosage, placeholder: "e.g. 1 tablet 3x daily" },
            { label: "Instructions", value: instructions, setter: setInstructions, placeholder: "e.g. Take with food" },
          ].map(({ label, value, setter, placeholder }) => (
            <View key={label}>
              <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, marginBottom: 12 }]}
                placeholder={placeholder}
                placeholderTextColor={colors.mutedForeground}
                value={value}
                onChangeText={setter}
              />
            </View>
          ))}
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]} onPress={handlePrescription}>
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
              {createPrescription.isPending ? "Issuing..." : "Issue Prescription"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal visible={showLabModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20 }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Request Lab Test</Text>
            <TouchableOpacity onPress={() => setShowLabModal(false)}>
              <Feather name="x" size={24} color={colors.foreground} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.label, { color: colors.foreground }]}>Test Type</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Blood Count, Malaria, HIV Test..."
            placeholderTextColor={colors.mutedForeground}
            value={testType}
            onChangeText={setTestType}
          />
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius, marginTop: 16 }]} onPress={handleLabRequest}>
            <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
              {createLabRequest.isPending ? "Creating..." : "Create Lab Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  section: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "700", marginBottom: 4 },
  patientName: { fontSize: 20, fontWeight: "700" },
  row: { flexDirection: "row", gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  label: { fontSize: 12, fontWeight: "500", marginBottom: 4 },
  value: { fontSize: 15, lineHeight: 22 },
  attachmentsSection: { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 12 },
  attachmentsRow: { marginTop: 8 },
  attachmentPreview: { width: 120, height: 120, borderRadius: 14, marginRight: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 14, minHeight: 44 },
  btn: { height: 48, justifyContent: "center", alignItems: "center" },
  btnText: { fontSize: 15, fontWeight: "700" },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48 },
  actionText: { fontSize: 15, fontWeight: "600" },
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
});
