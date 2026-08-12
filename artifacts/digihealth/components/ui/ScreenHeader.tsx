import React from "react";
import {
  View, Text, TouchableOpacity, ImageBackground,
  StyleSheet, ImageSourcePropType, ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

interface ScreenHeaderProps {
  /** Require() image source for the ImageBackground. */
  backgroundSource: ImageSourcePropType;
  title: string;
  subtitle?: string;
  /** Overlay colour. Defaults to semi-transparent black. */
  overlayColor?: string;
  paddingTop?: number;
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Pass false to hide the back button. Defaults to true. */
  showBack?: boolean;
}

/**
 * Hero ImageBackground header used on detail / form screens.
 *
 * Satisfies SRP: owns only the image-header layout.
 * Satisfies OCP: extended via `children` slot, not by editing this component.
 */
export function ScreenHeader({
  backgroundSource,
  title,
  subtitle,
  overlayColor = "rgba(0,0,0,0.52)",
  paddingTop = 0,
  children,
  style,
  showBack = true,
}: ScreenHeaderProps) {
  return (
    <ImageBackground
      source={backgroundSource}
      style={[styles.heroBg, style, { paddingTop }]}
      imageStyle={styles.heroImg}
    >
      <View style={[styles.overlay, { backgroundColor: overlayColor }]}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  heroBg: { height: 140, justifyContent: "flex-end" },
  heroImg: { resizeMode: "cover" },
  overlay: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
});
