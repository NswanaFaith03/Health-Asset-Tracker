import React from "react";
import { View, Text, ImageBackground, StyleSheet, useWindowDimensions } from "react-native";

type Props = {
  imageUri?: string;
  title: string;
  subtitle?: string;
  height?: number;
};

export default function ScreenHeader({ imageUri, title, subtitle, height = 160 }: Props) {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={imageUri ? { uri: imageUri } : require("../assets/images/happystudents.jpg")}
        style={[styles.hero, { height, width }]}
        imageStyle={styles.image}
      >
        <View style={styles.imageOverlay} />
      </ImageBackground>

      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#ffffff" },
  hero: { justifyContent: "flex-end" },
  image: { resizeMode: "cover", opacity: 0.95 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  card: {
    marginHorizontal: 16,
    marginTop: -36,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#000000" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 6 },
});
