import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateConsultation,
  getListConsultationsQueryKey,
  getGetStudentDashboardQueryKey,
} from "@workspace/api-client-react";
import { router } from "expo-router";
import type { SeverityKey } from "./types";

/**
 * Owns all state and side-effects for the New Consultation form.
 *
 * Satisfies SRP: screens delegate form logic here; they only render.
 * Satisfies DIP: screen depends on this hook (abstraction), not on API mutations directly.
 */
export function useConsultationForm() {
  const queryClient = useQueryClient();
  const createMutation = useCreateConsultation();

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

  const toggleSystem = (system: string) =>
    setSelectedSystems((prev) =>
      prev.includes(system) ? prev.filter((x) => x !== system) : [...prev, system]
    );

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
    if (!result.canceled && result.assets?.length > 0) {
      setAttachments((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeAttachment = (uri: string) =>
    setAttachments((prev) => prev.filter((item) => item !== uri));

  const buildSymptomsText = (): string => {
    const lines: string[] = [`Symptoms: ${chiefComplaint}`];
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

  const validate = (): boolean => {
    if (!chiefComplaint.trim()) {
      Alert.alert("Required", "Please describe your symptoms.");
      return false;
    }
    if (!onset || !duration) {
      Alert.alert("Required", "Please select onset and duration.");
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!validate()) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    createMutation.mutate(
      { data: { symptoms: buildSymptomsText(), severity, attachments } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConsultationsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudentDashboardQueryKey() });
          Alert.alert(
            "Submitted ✓",
            "Your consultation has been submitted. A doctor will respond shortly.",
            [{ text: "OK", onPress: () => router.back() }]
          );
        },
        onError: () => Alert.alert("Error", "Failed to submit consultation. Please try again."),
      }
    );
  };

  return {
    fields: {
      severity, chiefComplaint, selectedSystems,
      onset, duration, worsening,
      associatedSymptoms, medicalHistory, currentMedications,
      allergies, attachments,
    },
    setters: {
      setSeverity, setChiefComplaint, setOnset,
      setDuration, setWorsening, setAssociatedSymptoms,
      setMedicalHistory, setCurrentMedications, setAllergies,
    },
    handlers: { toggleSystem, addAttachment, removeAttachment },
    submit,
    isPending: createMutation.isPending,
  };
}
