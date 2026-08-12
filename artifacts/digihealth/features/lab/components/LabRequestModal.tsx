import React, { useState } from "react";
import {
  View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useCreateLabRequest } from "@workspace/api-client-react";
import { useColors } from "../../../hooks/useColors";

interface LabRequestModalProps {
  visible: boolean;
  onClose: () => void;
  patientId: number;
  consultationId: number;
  paddingTop?: number;
}

/**
 * Lab request modal.
 *
 * Satisfies SRP: owns only lab test request form and submission.
 */
export function LabRequestModal({
  visible, onClose, patientId, consultationId, paddingTop = 20,
}: LabRequestModalProps) {
  const colors = useColors();
  const createLabRequest = useCreateLabRequest();
  const [testType, setTestType] = useState("");

  const handleSubmit = () => {
    if (!testType) {
      Alert.alert("Required", "Enter test type");
      return;
    }
    createLabRequest.mutate(
      { data: { patientId, consultationId, testType } },
      {
        onSuccess: () => {
          setTestType("");
          onClose();
          Alert.alert("Done", "Lab request created");
        },
        onError: () => Alert.alert("Error", "Failed to create lab request"),
      }
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Request Lab Test</Text>
          <TouchableOpacity onPress={onClose}>
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

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary, borderRadius: colors.radius, marginTop: 16 }]}
          onPress={handleSubmit}
          disabled={createLabRequest.isPending}
        >
          <Text style={[styles.btnText, { color: colors.primaryForeground }]}>
            {createLabRequest.isPending ? "Creating..." : "Create Lab Request"}
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
  label: { fontSize: 13, fontWeight: "600", marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  btn: { height: 48, justifyContent: "center", alignItems: "center" },
  btnText: { fontSize: 15, fontWeight: "700" },
});
