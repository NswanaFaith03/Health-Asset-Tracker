import { Platform } from "react-native";

export function useWeb() {
  return Platform.OS === "web";
}

export function useMobile() {
  return Platform.OS !== "web";
}