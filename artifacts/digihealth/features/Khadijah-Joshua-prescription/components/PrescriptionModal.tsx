/**
 * @module Prescription Features
 * @file PrescriptionModal.tsx
 * @developer Khadijah & Joshua
 * @role Senior Diagnostics & Pharmacy Integration / Senior Security & Core Lead Specialist
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import React, { useState } from "react";
import {
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCreatePrescription } from "@workspace/api-client-react";
import { useColors } from "../../../hooks/useColors";

interface PrescriptionModalProps {
  visible: boolean;
  onClose: () => void;
  patientId: number;
  consultationId: number;
  paddingTop?: number;
}

/**
 * Prescription issue modal.
 *
 * Satisfies SRP: owns only prescription form and submission.
 * Satisfies DIP: uses useCreatePrescription (abstraction), not customFetch.
 */
export function PrescriptionModal({
  visible, onClose, patientId, consultationId, paddingTop = 20,
}: PrescriptionModalProps) {
  const colors = useColors();
  const createPrescription = useCreatePrescription();

  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleSubmit = () => {
    if (!medication || !dosage || !instructions) {
      Alert.alert("Required", "Fill all fields");
      return;
    }
    createPrescription.mutate(
      { data: { patientId, consultationId, medication, dosage, instructions } },
      {
        onSuccess: () => {
          setMedication("");
          setDosage("");
          setInstructions("");
          onClose();
          Alert.alert("Done", "Prescription issued");
        },
        onError: () => Alert.alert("Error", "Failed to create prescription"),
      }
    );
  };

  const fields = [
    { label: "Medication",    value: medication,    setter: setMedication,    placeholder: "e.g. Amoxicillin 500mg" },
    { label: "Dosage",        value: dosage,        setter: setDosage,        placeholder: "e.g. 1 tablet 3x daily" },
    { label: "Instructions",  value: instructions,  setter: setInstructions,  placeholder: "e.g. Take with food" },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Issue Prescription</Text>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {fields.map(({ label, value, setter, placeholder }) => (
          <View key={label}>
            <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder={placeholder}
              placeholderTextColor={colors.mutedForeground}
              value={value}
              onChangeText={setter}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
          onPress={handleSubmit}
          disabled={createPrescription.isPending}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
            {createPrescription.isPending ? "Issuing..." : "Issue Prescription"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 17, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 12 },
  btn: { height: 48, justifyContent: "center", alignItems: "center", marginTop: 8 },
  btnText: { fontSize: 15, fontWeight: "700" },
});
