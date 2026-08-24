/**
 * @module Core App Entry
 * @file _layout.tsx
 * @developer Joshua
 * @role Senior Security, Authentication, & Core Platform Lead
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Constants from "expo-constants";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Animated, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { setBaseUrl, useListNotifications, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// Polls and shows banner for new notifications
function NotificationToast() {
  const { currentUser } = useAuth();
  const qc = useQueryClient();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const seenIds = useRef<Set<number>>(new Set());

  const { data: notifications } = useListNotifications(
    { query: { queryKey: getListNotificationsQueryKey(), refetchInterval: 30_000, enabled: !!currentUser } }
  );

  useEffect(() => {
    if (!notifications) return;
    const unread = (notifications as any[]).filter((n) => !n.readStatus);
    const unseen = unread.filter((n) => !seenIds.current.has(n.id));
    if (unseen.length === 0) return;
    unseen.forEach((n) => seenIds.current.add(n.id));
    const latest = unseen[0];
    setToast({ title: latest.title, message: latest.message });
    Animated.sequence([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 8 }),
      Animated.delay(3500),
      Animated.timing(slideAnim, { toValue: -120, useNativeDriver: true, duration: 300 }),
    ]).start(() => setToast(null));
  }, [notifications]);

  if (!toast) return null;
  return (
    <Animated.View style={[toastStyles.banner, { transform: [{ translateY: slideAnim }] }]}>
      <View style={toastStyles.iconWrap}>
        <Feather name="bell" size={16} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={toastStyles.title}>{toast.title}</Text>
        <Text style={toastStyles.msg} numberOfLines={2}>{toast.message}</Text>
      </View>
      <TouchableOpacity onPress={() => { Animated.timing(slideAnim, { toValue: -120, useNativeDriver: true, duration: 200 }).start(() => setToast(null)); }}>
        <Feather name="x" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const toastStyles = StyleSheet.create({
  banner: {
    position: "absolute", top: 0, left: 12, right: 12, zIndex: 9999,
    backgroundColor: "#10b981", borderRadius: 16, flexDirection: "row", alignItems: "center",
    gap: 10, paddingHorizontal: 14, paddingVertical: 12,
    shadowColor: "#10b981", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 12,
  },
  iconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  title: { fontSize: 14, fontWeight: "700", color: "#fff" },
  msg: { fontSize: 12, color: "rgba(255,255,255,0.9)", marginTop: 2 },
});


function getDevApiBaseUrl(): string {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    ((Constants as any).manifest2?.extra?.expoGo?.debuggerHost as string | undefined) ??
    ((Constants as any).manifest?.debuggerHost as string | undefined);

  const host = hostUri?.split(":", 1)[0];

  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:5000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:5000";
  }

  return "http://localhost:5000";
}

const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  getDevApiBaseUrl();

if (apiBaseUrl) {
  setBaseUrl(apiBaseUrl);
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(Joshua-auth)" />
      <Stack.Screen name="(Faith-student)" />
      <Stack.Screen name="(AAron-doctor)" />
      <Stack.Screen name="(Khadijah-Joshua-pharmacist)" />
      <Stack.Screen name="(Khadijah-lab)" />
      <Stack.Screen name="(Faith-moses-mental-health)" />
      <Stack.Screen name="(moses-hiv-support)" />
      <Stack.Screen name="(Joshua-admin)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    ...Feather.font,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <ThemeProvider>
                  <View style={{ flex: 1 }}>
                    <RootLayoutNav />
                    <NotificationToast />
                  </View>
                </ThemeProvider>
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
