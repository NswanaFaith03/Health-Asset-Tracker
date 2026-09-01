import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, setAuthTokenGetter } from "@workspace/api-client-react";
import { router } from "expo-router";

interface AuthContextType {
  currentUser: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateCurrentUser: (user: User) => Promise<void>;
  isOnShift: boolean;
  startShift: () => Promise<void>;
  endShift: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage helpers for cross-platform compatibility
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnShift, setIsOnShift] = useState(false);

  // Provide the auth token to the API client
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await storage.getItem("auth_token");
        const storedUserStr = await storage.getItem("auth_user");
        const storedShift = await storage.getItem("shift_status");
        
        if (storedToken && storedUserStr) {
          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUserStr));
        }
        if (storedShift) {
          setIsOnShift(storedShift === "active");
        }
      } catch (e) {
        console.error("Failed to load auth state", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuth();
  }, []);

  const login = async (newToken: string, user: User) => {
    try {
      setToken(newToken);
      setCurrentUser(user);
      await storage.setItem("auth_token", newToken);
      await storage.setItem("auth_user", JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save auth state", e);
    }
  };

  const updateCurrentUser = async (user: User) => {
    try {
      setCurrentUser(user);
      await storage.setItem("auth_user", JSON.stringify(user));
    } catch (e) {
      console.error("Failed to update auth user state", e);
    }
  };

  const logout = async () => {
    try {
      await storage.removeItem("auth_token");
      await storage.removeItem("auth_user");
      await storage.removeItem("shift_status");
      setToken(null);
      setCurrentUser(null);
      setIsOnShift(false);
      router.replace("/(Joshua-auth)/login");
    } catch (e) {
      console.error("Failed to clear auth state", e);
    }
  };

  const startShift = async () => {
    try {
      setIsOnShift(true);
      await storage.setItem("shift_status", "active");
    } catch (e) {
      console.error("Failed to start shift", e);
    }
  };

  const endShift = async () => {
    try {
      setIsOnShift(false);
      await storage.setItem("shift_status", "inactive");
    } catch (e) {
      console.error("Failed to end shift", e);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, isLoading, login, logout, updateCurrentUser, isOnShift, startShift, endShift }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}