import React from "react";
import { View, Text, ImageBackground, StyleSheet, useWindowDimensions } from "react-native";
import design from "@/constants/design";

type Props = {
  imageUri?: string;
  title: string;
  subtitle?: string;
  height?: number;
};

export default function ScreenHeader({ imageUri, title, subtitle, height = 160 }: Props) {
  const { width } = useWindowDimensions();
  return (
    <View style={[styles.wrapper, { backgroundColor: design.colors.background }] }>
      <ImageBackground
        source={imageUri ? { uri: imageUri } : require("../assets/images/happystudents.jpg")}
        style={[styles.hero, { height, width }]}
        imageStyle={styles.image}
      >
        <View style={styles.contentCard}>
          <Text style={[styles.title, { fontSize: design.typography.sizes.lg, color: design.colors.text }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: design.colors.muted }]}>{subtitle}</Text> : null}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#ffffff" },
  hero: { justifyContent: "flex-end", padding: 20 },
  image: { resizeMode: "cover", opacity: 1 },
  contentCard: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#000000" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 6 },
});
