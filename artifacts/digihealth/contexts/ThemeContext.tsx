import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { themePalettes, defaultThemeKey, type ThemeKey, radius } from "@/constants/colors";

const THEME_STORAGE_KEY = "app_theme_key";

type ThemeTokens = typeof themePalettes[ThemeKey] & { radius: number };

interface ThemeContextType {
  theme: ThemeTokens;
  themeKey: ThemeKey;
  themeKeys: ThemeKey[];
  setThemeKey: (key: ThemeKey) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(defaultThemeKey);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedKey = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedKey && storedKey in themePalettes) {
          setThemeKeyState(storedKey as ThemeKey);
        }
      } catch (error) {
        console.error("Failed to load theme", error);
      }
    };
    loadTheme();
  }, []);

  const setThemeKey = async (key: ThemeKey) => {
    if (!(key in themePalettes)) return;
    setThemeKeyState(key);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, key);
    } catch (error) {
      console.error("Failed to save theme", error);
    }
  };

  const theme = useMemo(
    () => ({ ...themePalettes[themeKey], radius }),
    [themeKey]
  );

  return (
    <ThemeContext.Provider value={{ theme, themeKey, themeKeys: Object.keys(themePalettes) as ThemeKey[], setThemeKey }}>
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
