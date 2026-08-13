import React, { createContext, useContext, useMemo } from "react";
import { themePalettes, defaultThemeKey, type ThemeKey, radius } from "@/constants/colors";

type ThemeTokens = typeof themePalettes[ThemeKey] & { radius: number };

interface ThemeContextType {
  theme: ThemeTokens;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useMemo(
    () => ({ ...themePalettes[defaultThemeKey], radius }),
    []
  );

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
