import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../hooks/useColors";
import { customFetch } from "@workspace/api-client-react";

export default function AdminEmergency() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const [emergencyNumber, setEmergencyNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await customFetch<{ emergencyNumber?: string }>("/api/admin/emergency-phone");
        if (response?.emergencyNumber) {
          setEmergencyNumber(response.emergencyNumber);
        }
      } catch (error: any) {
        console.error("Failed to load emergency number", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!emergencyNumber.trim()) {
      Alert.alert("Required", "Enter an emergency phone number.");
      return;
    }

    setIsSaving(true);
    try {
      await customFetch("/api/admin/emergency-phone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emergencyNumber: emergencyNumber.trim() }),
      });
      Alert.alert("Saved", "Emergency call number updated successfully.");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to save emergency number.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 16 }]}> 
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <Text style={[styles.title, { color: colors.foreground }]}>Emergency Contact</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Set the number students call when they need help.</Text>
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>
      ) : (
        <View style={styles.body}> 
          <Text style={[styles.label, { color: colors.foreground }]}>Emergency Phone Number</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
            placeholder="e.g. +260971234567"
            placeholderTextColor={colors.mutedForeground}
            value={emergencyNumber}
            onChangeText={setEmergencyNumber}
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>Save Number</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { margin: 16, padding: 20, borderRadius: 18, borderWidth: 1 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 14, lineHeight: 20 },
  body: { marginHorizontal: 16, marginTop: 16 },
  label: { fontSize: 13, fontWeight: "700", marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 14, padding: 12, fontSize: 16, marginBottom: 18 },
  button: { alignItems: "center", justifyContent: "center", borderRadius: 14, paddingVertical: 14 },
  buttonText: { fontSize: 15, fontWeight: "700" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
