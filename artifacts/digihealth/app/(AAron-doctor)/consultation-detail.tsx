/**
 * @module AAron-Doctor Portal
 * @file consultation-detail.tsx
 * @developer AAron
 * @role Senior Clinical Systems Architect
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

/**
 * Doctor Consultation Detail — Sprint 4 thin wrapper.
 *
 * Inline prescription and lab modals replaced with PrescriptionModal / LabRequestModal
 * from features/Khadijah-Joshua-prescription and features/Khadijah-lab.
 * STATUS_COLORS / SEVERITY_COLORS imported from features/AAron-consultation/constants.
 */
import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetConsultation, useUpdateConsultation, useUpdateConsultationStatus,
  getGetConsultationQueryKey, getListConsultationsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";
import { Badge } from "../../components/ui/Badge";
import { PrescriptionModal } from "../../features/Khadijah-Joshua-prescription/components/PrescriptionModal";
import { LabRequestModal } from "../../features/Khadijah-lab/components/LabRequestModal";
import { ConsultationActions } from "../../features/AAron-consultation/components/ConsultationActions";
import {
  STATUS_COLORS, SEVERITY_COLORS,
} from "../../features/AAron-consultation/constants";

export default function DoctorConsultationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();
  const consultationId = useMemo(() => {
    const parsed = Number(id);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }, [id]);

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showLabModal, setShowLabModal] = useState(false);

  const { data: consultation, isLoading } = useGetConsultation(consultationId, {
    query: { enabled: consultationId > 0, queryKey: getGetConsultationQueryKey(consultationId) },
  });
  const updateConsultation = useUpdateConsultation();
  const updateStatus = useUpdateConsultationStatus();

  const handleRespond = () => {
    if (!diagnosis.trim()) { Alert.alert("Required", "Enter a diagnosis"); return; }
    updateConsultation.mutate(
      { id: consultationId, data: { diagnosis: diagnosis.trim(), notes: notes.trim(), status: "responded" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetConsultationQueryKey(consultationId) });
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
          Alert.alert("Done", "Response submitted");
        },
      }
    );
  };

  const handleAssign = () => {
    updateStatus.mutate(
      { id: consultationId, data: { status: "assigned", doctorId: currentUser?.id } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetConsultationQueryKey(consultationId) }) }
    );
  };

  const handleLifecycleToggle = (status: "submitted" | "closed") => {
    if (!consultationId) {
      Alert.alert("Invalid consultation", "This consultation cannot be updated.");
      return;
    }

    updateStatus.mutate(
      { id: consultationId, data: { status, doctorId: currentUser?.id } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetConsultationQueryKey(consultationId) });
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
          Alert.alert("Updated", status === "closed" ? "Consultation closed." : "Consultation reopened.");
        },
        onError: (error: any) => {
          Alert.alert("Error", error?.message || "Unable to update consultation state.");
        },
      }
    );
  };

  const c = consultation as any;

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
      ) : consultationId <= 0 || !c ? (
        <View style={styles.center}><Text style={{ color: colors.mutedForeground }}>Consultation not found</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          {/* Patient summary card */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.patientName, { color: colors.foreground }]}>{c.student?.name ?? "Patient"}</Text>
            <View style={styles.row}>
              <Badge status={c.status ?? ""} colorMap={STATUS_COLORS} />
              <Badge status={c.severity ?? ""} colorMap={SEVERITY_COLORS} />
            </View>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Symptoms</Text>
            <Text style={[styles.value, { color: colors.foreground }]}>{c.symptoms}</Text>
            {(c.attachments ?? []).length > 0 && (
              <View style={[styles.attachmentsSection, { borderColor: colors.border }]}> 
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Attached Photos</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attachmentsRow}>
                  {(c.attachments ?? []).map((uri: string) => (
                    <Image key={uri} source={{ uri }} style={styles.attachmentPreview} />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          {c.status === "submitted" && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              onPress={handleAssign}
            >
              <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Accept & Assign to Me</Text>
            </TouchableOpacity>
          )}

          {(c.status === "closed" || c.status === "resolved") && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.secondary, borderRadius: colors.radius, marginTop: 12 }]}
              onPress={() => handleLifecycleToggle("submitted")}
            >
              <Text style={[styles.btnText, { color: colors.primary }]}>Reopen Consultation</Text>
            </TouchableOpacity>
          )}

          {c.status !== "closed" && c.status !== "resolved" && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.muted, borderRadius: colors.radius, marginTop: 12 }]}
              onPress={() => handleLifecycleToggle("closed")}
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>Close Consultation</Text>
            </TouchableOpacity>
          )}

          {/* Response card */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}> 
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Response</Text>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Diagnosis</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="Enter diagnosis..."
              placeholderTextColor={colors.mutedForeground}
              value={diagnosis || (c.diagnosis ?? "")}
              onChangeText={setDiagnosis}
              multiline
            />
            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 12 }]}>Notes</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.background }]}
              placeholder="Additional notes..."
              placeholderTextColor={colors.mutedForeground}
              value={notes || (c.notes ?? "")}
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

          {/* Consultation Actions - Polymorphic */}
          <ConsultationActions
            consultationId={consultationId}
            currentStatus={c.status ?? ""}
            consultationOwnerId={c.student?.id ?? 0}
            onActionComplete={() => {
              queryClient.invalidateQueries({ queryKey: getGetConsultationQueryKey(consultationId) });
              queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
            }}
          />

          {/* Action buttons → open feature modals */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
              onPress={() => setShowPrescriptionModal(true)}
            >
              <Feather name="package" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Prescribe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.secondary, borderRadius: colors.radius }]}
              onPress={() => setShowLabModal(true)}
            >
              <Feather name="activity" size={18} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>Lab Request</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      <PrescriptionModal
        visible={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        patientId={c?.student?.id ?? 0}
        consultationId={consultationId}
        paddingTop={insets.top + 20}
      />

      <LabRequestModal
        visible={showLabModal}
        onClose={() => setShowLabModal(false)}
        patientId={c?.student?.id ?? 0}
        consultationId={consultationId}
        paddingTop={insets.top + 20}
      />
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
