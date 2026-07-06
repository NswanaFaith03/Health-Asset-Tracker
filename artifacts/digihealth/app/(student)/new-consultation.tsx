import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, TextInput,
  ScrollView, ImageBackground, KeyboardAvoidingView, Platform, Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { useCreateConsultation, getListConsultationsQueryKey, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";

const CLINIC_BG = require("../../assets/images/unzaclinic.jpeg");

const SEVERITIES = [
  { key: "low", label: "Mild", color: "#10b981", desc: "Minor / manageable" },
  { key: "medium", label: "Moderate", color: "#f59e0b", desc: "Affecting daily activity" },
  { key: "high", label: "Severe", color: "#f97316", desc: "Significant distress" },
  { key: "critical", label: "Critical", color: "#ef4444", desc: "Urgent — needs immediate care" },
] as const;

type SeverityKey = (typeof SEVERITIES)[number]["key"];

const BODY_SYSTEMS = [
  "Head / Neurological", "Eyes / Ears / Nose / Throat", "Chest / Respiratory",
  "Heart / Cardiovascular", "Abdomen / Digestive", "Urinary / Reproductive",
  "Skin / Musculoskeletal", "Mental / Psychological", "Other / General",
];

const DURATIONS = ["Today only", "2–3 days", "4–7 days", "1–2 weeks", "More than 2 weeks"];
const ONSET = ["Sudden (came on quickly)", "Gradual (slowly got worse)"];
const YES_NO = ["Yes", "No", "Not sure"];

export default function NewConsultation() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();

  // Core fields
  const [severity, setSeverity] = useState<SeverityKey>("low");
  const [chiefComplaint, setChiefComplaint] = useState("");
  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);
  const [onset, setOnset] = useState("");
  const [duration, setDuration] = useState("");
  const [worsening, setWorsening] = useState("");
  const [associatedSymptoms, setAssociatedSymptoms] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);

  const createMutation = useCreateConsultation();

  const toggleSystem = (s: string) =>
    setSelectedSystems((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const addAttachment = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your photos to attach an image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAttachments((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeAttachment = (uri: string) => setAttachments((prev) => prev.filter((item) => item !== uri));

  const buildSymptomsText = () => {
    const lines: string[] = [];
    lines.push(`Symptoms: ${chiefComplaint}`);
    if (selectedSystems.length) lines.push(`Affected Body Systems: ${selectedSystems.join(", ")}`);
    if (onset) lines.push(`Onset: ${onset}`);
    if (duration) lines.push(`Duration: ${duration}`);
    if (worsening) lines.push(`Getting worse? ${worsening}`);
    if (associatedSymptoms) lines.push(`Associated Symptoms: ${associatedSymptoms}`);
    if (medicalHistory) lines.push(`Past Medical History: ${medicalHistory}`);
    if (currentMedications) lines.push(`Current Medications: ${currentMedications}`);
    if (allergies) lines.push(`Known Allergies: ${allergies}`);
    return lines.join("\n");
  };

  const handleSubmit = async () => {
    if (!chiefComplaint.trim()) {
      Alert.alert("Required", "Please describe your symptoms.");
      return;
    }
    if (!onset || !duration) {
      Alert.alert("Required", "Please select onset and duration.");
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createMutation.mutate(
      { data: { symptoms: buildSymptomsText(), severity, attachments } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          Alert.alert("Submitted ✓", "Your consultation has been submitted. A doctor will respond shortly.", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: () => Alert.alert("Error", "Failed to submit consultation. Please try again."),
      }
    );
  };

  const Section = ({ title }: { title: string }) => (
    <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
  );

  const Label = ({ text }: { text: string }) => (
    <Text style={[styles.label, { color: colors.foreground }]}>{text}</Text>
  );

  const chipStyle = (active: boolean, color?: string) => ({
    ...styles.chip,
    backgroundColor: active ? (color ?? colors.primary) + "22" : colors.card,
    borderColor: active ? (color ?? colors.primary) : colors.border,
  });

  const chipTextStyle = (active: boolean, color?: string) => ({
    ...styles.chipText,
    color: active ? (color ?? colors.primary) : colors.mutedForeground,
    fontWeight: active ? ("700" as const) : ("400" as const),
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header over clinic background */}
      <ImageBackground source={CLINIC_BG} style={[styles.heroBg, { paddingTop: insets.top }]} imageStyle={styles.heroImg}>
        <View style={styles.heroOverlay}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>New Consultation</Text>
            <Text style={styles.heroSub}>UNZA Health & Wellness Clinic</Text>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: "#10b98133" }]}>
            <Feather name="activity" size={14} color="#10b981" />
            <Text style={styles.heroBadgeText}>Secure</Text>
          </View>
        </View>
      </ImageBackground>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Describe Symptoms */}
          <Section title="1. Describe Your Symptoms" />
          <Label text="Tell us the main symptoms you are experiencing. *" />
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. My throat is sore and I have a headache since this morning..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={4}
            value={chiefComplaint}
            onChangeText={setChiefComplaint}
            textAlignVertical="top"
          />

          {/* 2. Affected Body System */}
          <Section title="2. Affected Body Area / System" />
          <Label text="Select all that apply" />
          <View style={styles.chipWrap}>
            {BODY_SYSTEMS.map((s) => (
              <TouchableOpacity key={s} style={chipStyle(selectedSystems.includes(s))} onPress={() => toggleSystem(s)}>
                <Text style={chipTextStyle(selectedSystems.includes(s))}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 3. Onset & Duration */}
          <Section title="3. Onset & Duration" />
          <Label text="How did it start? *" />
          <View style={styles.chipWrap}>
            {ONSET.map((o) => (
              <TouchableOpacity key={o} style={chipStyle(onset === o)} onPress={() => setOnset(o)}>
                <Text style={chipTextStyle(onset === o)}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label text="How long have you had this? *" />
          <View style={styles.chipWrap}>
            {DURATIONS.map((d) => (
              <TouchableOpacity key={d} style={chipStyle(duration === d)} onPress={() => setDuration(d)}>
                <Text style={chipTextStyle(duration === d)}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Label text="Is it getting worse?" />
          <View style={styles.chipWrap}>
            {YES_NO.map((y) => (
              <TouchableOpacity key={y} style={chipStyle(worsening === y)} onPress={() => setWorsening(y)}>
                <Text style={chipTextStyle(worsening === y)}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Section title="4. Additional Symptoms" />
          <Label text="Any other symptoms? (nausea, dizziness, fatigue, etc.)" />
          <TextInput
            style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card, minHeight: 80 }]}
            placeholder="Describe any other symptoms you are experiencing..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            value={associatedSymptoms}
            onChangeText={setAssociatedSymptoms}
            textAlignVertical="top"
          />

          {/* 5. Photo Attachments */}
          <Section title="5. Attach a Photo" />
          <Label text="Upload a photo to help the doctor understand your condition." />
          <View style={styles.attachmentRow}>
            {attachments.map((uri) => (
              <View key={uri} style={styles.attachmentItem}>
                <Image source={{ uri }} style={styles.attachmentImage} />
                <TouchableOpacity style={styles.attachmentRemove} onPress={() => removeAttachment(uri)}>
                  <Feather name="x" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={[styles.attachmentAdd, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={addAttachment}>
              <Feather name="camera" size={20} color={colors.primary} />
              <Text style={[styles.attachmentAddText, { color: colors.primary }]}>Add Photo</Text>
            </TouchableOpacity>
          </View>

          {/* 6. Medical History */}
          <Section title="6. Medical & Medication History" />
          <Label text="Do you have any existing medical conditions?" />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Diabetes, Asthma, Hypertension — or None"
            placeholderTextColor={colors.mutedForeground}
            value={medicalHistory}
            onChangeText={setMedicalHistory}
          />

          <Label text="Are you currently taking any medications or supplements?" />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Metformin 500mg, Vitamin C — or None"
            placeholderTextColor={colors.mutedForeground}
            value={currentMedications}
            onChangeText={setCurrentMedications}
          />

          <Label text="Any known drug or food allergies?" />
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. Penicillin, Peanuts — or None known"
            placeholderTextColor={colors.mutedForeground}
            value={allergies}
            onChangeText={setAllergies}
          />

          {/* 7. Severity */}
          <Section title="7. Overall Severity" />
          <Label text="How severe is this overall?" />
          <View style={styles.severityGrid}>
            {SEVERITIES.map((s) => (
              <TouchableOpacity
                key={s.key}
                style={[styles.severityCard, { borderColor: severity === s.key ? s.color : colors.border, backgroundColor: severity === s.key ? s.color + "15" : colors.card }]}
                onPress={() => setSeverity(s.key)}
              >
                <View style={[styles.severityDot, { backgroundColor: s.color }]} />
                <Text style={[styles.severityLabel, { color: severity === s.key ? s.color : colors.foreground }]}>{s.label}</Text>
                <Text style={[styles.severityDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, borderRadius: colors.radius, opacity: createMutation.isPending ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Submitting...</Text>
            ) : (
              <>
                <Feather name="send" size={18} color={colors.primaryForeground} />
                <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Submit Consultation</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBg: { height: 140, justifyContent: "flex-end" },
  heroImg: { resizeMode: "cover" },
  heroOverlay: {
    flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16,
    paddingBottom: 16, paddingTop: 12, backgroundColor: "rgba(0,0,0,0.52)",
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", justifyContent: "center", alignItems: "center" },
  heroTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  heroSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText: { fontSize: 11, color: "#10b981", fontWeight: "600" },
  sectionTitle: { fontSize: 13, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 24, marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 14, minHeight: 100 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, marginBottom: 4 },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: { borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { fontSize: 13 },
  painRow: { flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 4 },
  painBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  attachmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  attachmentItem: { width: 92, height: 92, borderRadius: 14, overflow: "hidden", position: "relative" },
  attachmentImage: { width: "100%", height: "100%" },
  attachmentRemove: { position: "absolute", top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  attachmentAdd: { width: 92, height: 92, borderRadius: 14, borderWidth: 1.5, justifyContent: "center", alignItems: "center", gap: 6 },
  attachmentAddText: { fontSize: 12, fontWeight: "700" },
  severityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  severityCard: { width: "47%", borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 4 },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 2 },
  severityLabel: { fontSize: 15, fontWeight: "700" },
  severityDesc: { fontSize: 12 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 54, marginTop: 32 },
  submitText: { fontSize: 16, fontWeight: "700" },
});
