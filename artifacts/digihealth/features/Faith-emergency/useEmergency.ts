/**
 * @module Student Emergency Flow
 * @file useEmergency.ts
 * @developer Faith
 * @role Senior Student Experience Engineer
 * 
 * Part of the DigiHealth Asset Tracker system.
 * Designed with Solid principles, strict separation of concerns, and modular isolation.
 */

import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { EmergencyService } from "./EmergencyService";

/**
 * Owns all state and side-effects for the emergency call feature.
 *
 * Satisfies SRP: screens delegate emergency logic here; they only render a button.
 * Satisfies DIP: depends on EmergencyService, not on customFetch or Location APIs.
 */
export function useEmergency() {
  const service = useMemo(() => new EmergencyService(), []);
  const [emergencyNumber, setEmergencyNumber] = useState<string | null>(null);
  const [isLoadingNumber, setIsLoadingNumber] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    setIsLoadingNumber(true);
    service
      .fetchPhoneNumber()
      .then((n) => setEmergencyNumber(n))
      .finally(() => setIsLoadingNumber(false));
  }, [service]);

  const handleEmergencyCall = async () => {
    if (!emergencyNumber) {
      Alert.alert(
        "Emergency number not set",
        "Please ask an admin to configure the emergency contact number."
      );
      return;
    }
    setIsCalling(true);
    try {
      await service.logAndCall(emergencyNumber);
    } catch (error: any) {
      Alert.alert("Emergency call failed", error?.message || "Unable to place emergency call.");
    } finally {
      setIsCalling(false);
    }
  };

  return { emergencyNumber, isLoadingNumber, isCalling, handleEmergencyCall };
}
