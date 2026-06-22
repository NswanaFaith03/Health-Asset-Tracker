import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useCreateConsultation, getListConsultationsQueryKey, getGetStudentDashboardQueryKey } from "@workspace/api-client-react";
import { useColors } from "../../hooks/useColors";
import { KeyboardAwareScrollViewCompat } from "../../components/KeyboardAwareScrollViewCompat";

const SEVERITIES = [
  { key: "low", label: "Low", color: "#10b981", desc: "Minor symptoms" },
  { key: "medium", label: "Medium", color: "#f59e0b", desc: "Moderate discomfort" },
  { key: "high", label: "High", color: "#f97316", desc: "Significant concern" },
  { key: "critical", label: "Critical", color: "#ef4444", desc: "Urgent care needed" },
];

export default function NewConsultation() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const queryClient = useQueryClient();
  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState("low");

  const createMutation = useCreateConsultation();

  const handleSubmit = async () => {
    if (!symptoms.trim()) {
      Alert.alert("Required", "Please describe your symptoms");
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createMutation.mutate(
      { data: { symptoms: symptoms.trim(), severity } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          Alert.alert("Submitted", "Your consultation has been submitted successfully.", [
            { text: "OK", onPress: () => router.back() }
          ]);
        },
        onError: () => {
          Alert.alert("Error", "Failed to submit consultation. Please try again.");
        }
      }
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>New Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 40, paddingTop: 8 }}
      >
        <Text style={[styles.label, { color: colors.foreground }]}>Describe your symptoms</Text>
        <TextInput
          style={[styles.textArea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
          placeholder="Describe what you are experiencing..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={6}
          value={symptoms}
          onChangeText={setSymptoms}
          textAlignVertical="top"
        />

        <Text style={[styles.label, { color: colors.foreground, marginTop: 24 }]}>Severity level</Text>
        <View style={styles.severityGrid}>
          {SEVERITIES.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[
                styles.severityCard,
                { borderColor: severity === s.key ? s.color : colors.border, backgroundColor: severity === s.key ? s.color + "15" : colors.card }
              ]}
              onPress={() => setSeverity(s.key)}
            >
              <View style={[styles.severityDot, { backgroundColor: s.color }]} />
              <Text style={[styles.severityLabel, { color: severity === s.key ? s.color : colors.foreground }]}>{s.label}</Text>
              <Text style={[styles.severityDesc, { color: colors.mutedForeground }]}>{s.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, fontWeight: "700" },
  label: { fontSize: 15, fontWeight: "600", marginBottom: 10 },
  textArea: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, minHeight: 120 },
  severityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  severityCard: { width: "47%", borderWidth: 1.5, borderRadius: 12, padding: 14, gap: 4 },
  severityDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 2 },
  severityLabel: { fontSize: 15, fontWeight: "700" },
  severityDesc: { fontSize: 12 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, marginTop: 32 },
  submitText: { fontSize: 16, fontWeight: "700" },
});
