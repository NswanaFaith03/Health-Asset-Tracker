import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

let toastId = 0;
const listeners: Array<(toast: Toast | null) => void> = [];

export const Toast = {
  show: (message: string, type: ToastType = "info", duration: number = 3000) => {
    const id = String(++toastId);
    const toast: Toast = { id, message, type, duration };
    listeners.forEach((cb) => cb(toast));
    
    if (duration > 0) {
      setTimeout(() => {
        listeners.forEach((cb) => cb(null));
      }, duration);
    }
  },

  success: (message: string, duration?: number) => Toast.show(message, "success", duration),
  error: (message: string, duration?: number) => Toast.show(message, "error", duration),
  info: (message: string, duration?: number) => Toast.show(message, "info", duration),
  warning: (message: string, duration?: number) => Toast.show(message, "warning", duration),

  subscribe: (callback: (toast: Toast | null) => void) => {
    listeners.push(callback);
    return () => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    };
  },
};

interface ToastContainerProps {
  position?: "top" | "bottom";
}

export function ToastContainer({ position = "top" }: ToastContainerProps) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    const unsubscribe = Toast.subscribe((t) => {
      if (t) {
        setToast(t);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }
    });

    return unsubscribe;
  }, [fadeAnim]);

  if (!toast) return null;

  const typeColors = {
    success: { bg: "#10b981", icon: "✓" },
    error: { bg: "#ef4444", icon: "✕" },
    info: { bg: "#3b82f6", icon: "ℹ" },
    warning: { bg: "#f59e0b", icon: "⚠" },
  };

  const { bg, icon } = typeColors[toast.type];

  return (
    <Animated.View
      style={[
        styles.container,
        position === "top" ? styles.top : styles.bottom,
        { opacity: fadeAnim },
      ]}
    >
      <View style={[styles.toast, { backgroundColor: bg }]}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.message}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10000,
  },
  top: {
    top: 50,
  },
  bottom: {
    bottom: 50,
  },
  toast: {
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  icon: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  message: {
    flex: 1,
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
