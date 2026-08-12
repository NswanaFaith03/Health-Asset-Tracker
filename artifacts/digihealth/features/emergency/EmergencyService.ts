import { customFetch } from "@workspace/api-client-react";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

/**
 * Emergency call service.
 *
 * Satisfies SRP: owns all emergency-call business logic (fetch number, log call, dial).
 * Satisfies DIP: useEmergency hook depends on this, not on customFetch / Linking directly.
 */
export class EmergencyService {
  async fetchPhoneNumber(): Promise<string | null> {
    try {
      const response = await customFetch<{ emergencyNumber?: string }>("/api/emergency/phone");
      return response?.emergencyNumber ?? null;
    } catch {
      return null;
    }
  }

  async logAndCall(number: string): Promise<void> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Location permission required",
        "Allow location access to submit your current coordinates before calling."
      );
      return;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Highest,
    });
    await customFetch("/api/emergency/calls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }),
    });
    Linking.openURL(`tel:${number}`);
  }
}
