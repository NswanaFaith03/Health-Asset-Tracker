import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";

interface AnimatedButtonProps {
  label: string;
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "outline";
  style?: any;
  textStyle?: any;
  backgroundColor?: string;
  textColor?: string;
  loadingIndicatorColor?: string;
}

export function AnimatedButton({
  label,
  onPress,
  isLoading = false,
  disabled = false,
  variant = "primary",
  style,
  textStyle,
  backgroundColor,
  textColor,
  loadingIndicatorColor = "#fff",
}: AnimatedButtonProps) {
  const isInteractionDisabled = isLoading || disabled;

  const variantStyles: Record<string, { bg: string; text: string }> = {
    primary: { bg: backgroundColor || "#0f766e", text: textColor || "#fff" },
    secondary: { bg: backgroundColor || "#e5e7eb", text: textColor || "#1f2937" },
    danger: { bg: backgroundColor || "#ef4444", text: textColor || "#fff" },
    outline: { bg: backgroundColor || "transparent", text: textColor || "#0f766e" },
  };

  const { bg, text } = variantStyles[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isInteractionDisabled}
      activeOpacity={isInteractionDisabled ? 1 : 0.75}
      style={[
        styles.button,
        {
          backgroundColor: bg,
          opacity: isInteractionDisabled ? 0.6 : 1,
          borderWidth: variant === "outline" ? 1 : 0,
          borderColor: text,
        },
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={loadingIndicatorColor} />
      ) : (
        <Text style={[styles.label, { color: text }, textStyle]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
