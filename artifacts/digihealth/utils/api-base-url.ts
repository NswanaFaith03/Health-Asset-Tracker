import Constants from "expo-constants";
import { Platform } from "react-native";

function getExpoDebuggerHost(): string | undefined {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    ((Constants as any).manifest2?.extra?.expoGo?.debuggerHost as string | undefined) ??
    ((Constants as any).manifest?.debuggerHost as string | undefined);

  return hostUri?.split(":", 1)[0];
}

export function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "");
  if (configuredBaseUrl) return configuredBaseUrl.replace(/\/api$/, "");

  if (Platform.OS === "web") {
    return "https://health-asset-tracker.vercel.app";
  }

  const host = getExpoDebuggerHost();
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:5000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  return "http://localhost:5000";
}