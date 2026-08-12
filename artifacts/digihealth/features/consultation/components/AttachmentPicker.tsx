import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Text } from "react-native";
import { useColors } from "../../../hooks/useColors";

interface AttachmentPickerProps {
  attachments: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
}

/**
 * Photo attachment strip — displays thumbnails and an "Add Photo" button.
 *
 * Satisfies SRP: owns only attachment display and interaction.
 */
export function AttachmentPicker({ attachments, onAdd, onRemove }: AttachmentPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.row}>
      {attachments.map((uri) => (
        <View key={uri} style={styles.item}>
          <Image source={{ uri }} style={styles.image} />
          <TouchableOpacity style={styles.removeBtn} onPress={() => onRemove(uri)}>
            <Feather name="x" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        style={[styles.addBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
        onPress={onAdd}
      >
        <Feather name="camera" size={20} color={colors.primary} />
        <Text style={[styles.addText, { color: colors.primary }]}>Add Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 8 },
  item: { width: 92, height: 92, borderRadius: 14, overflow: "hidden", position: "relative" },
  image: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute", top: 8, right: 8,
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center", alignItems: "center",
  },
  addBtn: {
    width: 92, height: 92, borderRadius: 14, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center", gap: 6,
  },
  addText: { fontSize: 12, fontWeight: "700" },
});
