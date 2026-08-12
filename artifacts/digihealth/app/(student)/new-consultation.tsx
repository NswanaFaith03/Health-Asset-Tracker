/**
 * New Consultation screen — Sprint 3 thin wrapper.
 *
 * All form state, validation, and submission is delegated to `useConsultationForm`.
 * UI sub-components: SeverityPicker, AttachmentPicker (from features/consultation/).
 * Shared atoms: ChipGroup, FormField (from components/ui/).
 */
import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../hooks/useColors";
import { ScreenHeader } from "../../components/ui/ScreenHeader";
import { ChipGroup } from "../../components/ui/ChipGroup";
import { SeverityPicker } from "../../features/consultation/components/SeverityPicker";
import { AttachmentPicker } from "../../features/consultation/components/AttachmentPicker";
import { useConsultationForm } from "../../features/consultation/useConsultationForm";
import { BODY_SYSTEMS, DURATIONS, ONSET, YES_NO } from "../../features/consultation/constants";

const CLINIC_BG = require("../../assets/images/nursing_students.jpg");

export default function NewConsultation() {
  const insets = useSafeAreaInsets();
  const colors = useColors();

  const { fields, setters, handlers, submit, isPending } = useConsultationForm();

  const SectionTitle = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
  );

  const Label = ({ text }: { text: string }) => (
    <Text style={[styles.label, { color: colors.foreground }]}>{text}</Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        backgroundSource={CLINIC_BG}
        title="New Consultation"
        subtitle="UNZA Health & Wellness Clinic"
        paddingTop={insets.top}
        overlayColor="rgba(0,0,0,0.52)"
      >
        <View style={[styles.heroBadge, { backgroundColor: "#10b98133" }]}>
          <Feather name="activity" size={14} color="#10b981" />
          <Text style={styles.heroBadgeText}>Secure</Text>
        </View>
      </ScreenHeader>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <SectionTitle title="1. Describe Your Symptoms" />
          <Label text="Tell us the main symptoms you are experiencing. *" />
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. My throat is sore and I have a headache since this morning..."
            placeholderTextColor={colors.mutedForeground}
            multiline numberOfLines={4}
            value={fields.chiefComplaint}
            onChangeText={setters.setChiefComplaint}
            textAlignVertical="top"
          />

          <SectionTitle title="2. Affected Body Area / System" />
          <Label text="Select all that apply" />
          <ChipGroup
            options={BODY_SYSTEMS.map((s) => ({ key: s, label: s }))}
            selected={fields.selectedSystems}
            onToggle={handlers.toggleSystem}
          />

          <SectionTitle title="3. Onset & Duration" />
          <Label text="How did it start? *" />
          <ChipGroup
            options={ONSET.map((o) => ({ key: o, label: o }))}
            selected={fields.onset ? [fields.onset] : []}
            onToggle={(key) => setters.setOnset(fields.onset === key ? "" : key)}
          />

          <Label text="How long have you had this? *" />
          <ChipGroup
            options={DURATIONS.map((d) => ({ key: d, label: d }))}
            selected={fields.duration ? [fields.duration] : []}
            onToggle={(key) => setters.setDuration(fields.duration === key ? "" : key)}
          />

          <Label text="Is it getting worse?" />
          <ChipGroup
            options={YES_NO.map((y) => ({ key: y, label: y }))}
            selected={fields.worsening ? [fields.worsening] : []}
            onToggle={(key) => setters.setWorsening(fields.worsening === key ? "" : key)}
          />

          <SectionTitle title="4. Additional Symptoms" />
          <Label text="Any other symptoms? (nausea, dizziness, fatigue, etc.)" />
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, minHeight: 80 }]}
            placeholder="Describe any other symptoms you are experiencing..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={fields.associatedSymptoms}
            onChangeText={setters.setAssociatedSymptoms}
            textAlignVertical="top"
          />

          <SectionTitle title="5. Attach a Photo" />
          <Label text="Upload a photo to help the doctor understand your condition." />
          <AttachmentPicker
            attachments={fields.attachments}
            onAdd={handlers.addAttachment}
            onRemove={handlers.removeAttachment}
          />

          <SectionTitle title="6. Medical & Medication History" />
          <Label text="Do you have any existing medical conditions?" />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Diabetes, Asthma, Hypertension — or None"
            placeholderTextColor={colors.mutedForeground}
            value={fields.medicalHistory}
            onChangeText={setters.setMedicalHistory}
          />

          <Label text="Are you currently taking any medications or supplements?" />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Metformin 500mg, Vitamin C — or None"
            placeholderTextColor={colors.mutedForeground}
            value={fields.currentMedications}
            onChangeText={setters.setCurrentMedications}
          />

          <Label text="Any known drug or food allergies?" />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Penicillin, Peanuts — or None known"
            placeholderTextColor={colors.mutedForeground}
            value={fields.allergies}
            onChangeText={setters.setAllergies}
          />

          <SectionTitle title="7. Overall Severity" />
          <Label text="How severe is this overall?" />
          <SeverityPicker value={fields.severity} onChange={setters.setSeverity} />

          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: isPending ? 0.7 : 1 }]}
            onPress={submit}
            disabled={isPending}
          >
            <Feather name="send" size={18} color={colors.primaryForeground} />
            <Text style={[styles.submitText, { color: colors.primaryForeground }]}>
              {isPending ? "Submitting..." : "Submit Consultation"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, color: "#10b981", fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 24, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, minHeight: 100 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 4 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, marginTop: 32 },
  submitText: { fontSize: 16, fontWeight: "700" },
});
