import { useTheme } from "@/contexts/ThemeContext";

export function useColors() {
  return useTheme().theme;
}
