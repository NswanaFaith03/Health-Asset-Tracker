import React from "react";
import {
  View, Text, TextInput, StyleSheet,
  TextInputProps, ViewStyle,
} from "react-native";
import { useColors } from "../../hooks/useColors";

interface FormFieldProps extends TextInputProps {
  label: string;
  containerStyle?: ViewStyle;
  /** Set to true for multiline text areas. */
  multiline?: boolean;
}

/**
 * Label + TextInput pair.
 *
 * Satisfies SRP: owns only label-with-input layout.
 */
export function FormField({ label, containerStyle, multiline, style, ...inputProps }: FormFieldProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.foreground }]}>{label}</Text>
      <TextInput
        style={[
          multiline ? styles.textArea : styles.input,
          { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card },
          style,
        ]}
        placeholderTextColor={colors.mutedForeground}
        textAlignVertical={multiline ? "top" : undefined}
        multiline={multiline}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    minHeight: 100,
  },
});
