import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as ImagePicker from "expo-image-picker";
import { customFetch } from "@workspace/api-client-react";
import { useAuth } from "../../contexts/AuthContext";
import { useColors } from "../../hooks/useColors";

const ROLE_LABELS: Record<string, string> = {
  student: "Student", doctor: "Doctor", pharmacist: "Pharmacist",
  lab_technician: "Lab Technician", mental_health_counselor: "Counselor",
  hiv_professional: "HIV Professional", admin: "Administrator",
};

export default function Profile() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const getApiBaseUrl = () => {
    const hostUri =
      Constants.expoConfig?.hostUri ??
      ((Constants as any).manifest2?.extra?.expoGo?.debuggerHost as string | undefined) ??
      ((Constants as any).manifest?.debuggerHost as string | undefined);
    const host = hostUri?.split(":", 1)[0];
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:5000`;
    }
    if (Platform.OS === "android") {
      return "http://10.0.2.2:5000";
    }
    return "http://localhost:5000";
  };

  const avatarUrl = (currentUser as any)?.avatarUrl as string | undefined;
  const avatarUri = avatarUrl ? (avatarUrl.startsWith("http") ? avatarUrl : `${getApiBaseUrl()}${avatarUrl}`) : null;

  const handleUploadPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Allow access to your photos to upload a profile image.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    const canceled = (result as any).cancelled ?? (result as any).canceled;
    if (canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert("Upload failed", "Unable to read the selected image. Please try another photo.");
      return;
    }
    const filename = asset.uri?.split("/").pop() ?? `avatar-${Date.now()}.jpg`;
    setIsUploading(true);
    try {
      const response = await customFetch<{ user: any; url: string }>("/api/users/me/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, data: asset.base64 }),
      });
      await updateCurrentUser(response.user);
      Alert.alert("Profile photo saved", "Your profile photo has been uploaded.");
    } catch (err: any) {
      Alert.alert("Upload failed", err?.message || "Unable to upload photo. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: logout }
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 84, paddingHorizontal: 16 }}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <View style={[styles.avatarSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "20" }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: colors.primary }]}> 
              {currentUser?.name?.charAt(0).toUpperCase() ?? "U"}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleUploadPhoto} style={[styles.uploadBtn, { borderColor: colors.border, backgroundColor: colors.card }]}> 
          <Feather name="camera" size={16} color={colors.primary} />
          <Text style={[styles.uploadText, { color: colors.primary }]}> 
            {avatarUri ? "Change Photo" : "Upload Photo"}
          </Text>
        </TouchableOpacity>
        <Text style={[styles.name, { color: colors.foreground }]}>{currentUser?.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primary + "20" }]}> 
          <Text style={[styles.roleText, { color: colors.primary }]}> 
            {ROLE_LABELS[currentUser?.role ?? "student"] ?? currentUser?.role}
          </Text>
        </View>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{currentUser?.email}</Text>
      </View>

      {currentUser?.phone && (
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="phone" size={18} color={colors.primary} />
          <View>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{currentUser.phone}</Text>
          </View>
        </View>
      )}

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="shield" size={18} color={colors.primary} />
        <View>
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Account Status</Text>
          <Text style={[styles.infoValue, { color: "#10b981" }]}>Active</Text>
        </View>
      </View>

      <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.aboutTitle, { color: colors.foreground }]}>About UNZA DigiHealth</Text>
        <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
          A digital healthcare platform for the University of Zambia campus clinic. Connect with doctors, access prescriptions, lab results, mental health support, and HIV/AIDS resources — all in one place.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: "#ef4444", borderRadius: colors.radius }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={18} color="#ef4444" />
        <Text style={[styles.logoutText, { color: "#ef4444" }]}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 16 },
  avatarSection: { borderRadius: 12, borderWidth: 1, padding: 24, alignItems: "center", gap: 8, marginBottom: 12 },
  avatar: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", marginBottom: 8, overflow: "hidden" },
  avatarImage: { width: 72, height: 72, borderRadius: 36 },
  avatarText: { fontSize: 32, fontWeight: "700" },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderRadius: 999, marginBottom: 10 },
  uploadText: { fontSize: 13, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700" },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 13, fontWeight: "600" },
  email: { fontSize: 14 },
  infoCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 10 },
  infoLabel: { fontSize: 12, fontWeight: "500" },
  infoValue: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  aboutCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 16, gap: 8 },
  aboutTitle: { fontSize: 16, fontWeight: "700" },
  aboutText: { fontSize: 14, lineHeight: 20 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderWidth: 1 },
  logoutText: { fontSize: 16, fontWeight: "600" },
});
