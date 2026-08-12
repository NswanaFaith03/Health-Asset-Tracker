import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  backgroundColor?: string;
  spinnerColor?: string;
}

export function LoadingOverlay({
  visible,
  message,
  backgroundColor = "rgba(0, 0, 0, 0.6)",
  spinnerColor = "#fff",
}: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor }]}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color={spinnerColor} />
        {message && <View style={styles.messageSpacer} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  content: {
    alignItems: "center",
    gap: 16,
  },
  messageSpacer: {
    height: 8,
  },
});
