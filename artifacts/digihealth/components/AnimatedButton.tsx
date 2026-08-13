import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from "react-native";
import design from "@/constants/design";

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
    primary: { bg: backgroundColor || design.colors.primary, text: textColor || design.colors.primaryForeground },
    secondary: { bg: backgroundColor || design.colors.surface, text: textColor || design.colors.text },
    danger: { bg: backgroundColor || "#ef4444", text: textColor || "#fff" },
    outline: { bg: backgroundColor || "transparent", text: textColor || design.colors.primary },
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
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
  },
});
