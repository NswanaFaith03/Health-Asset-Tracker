import React, { createContext, useContext, useEffect, useState } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set token getter for API client
    setAuthTokenGetter(() => {
      let currentToken = null;
      // We can't await inside the getter, so we return the token in state
      // but ideally we should fetch from storage synchronously or rely on state.
      // Since it's a sync getter, we'll capture a ref or use the closure.
      return token; 
    });
  }, []);

  useEffect(() => {
    // Update getter when token changes
    setAuthTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("auth_token");
        const storedUserStr = await AsyncStorage.getItem("auth_user");
        
        if (storedToken && storedUserStr) {
          setToken(storedToken);
          setCurrentUser(JSON.parse(storedUserStr));
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
      await AsyncStorage.setItem("auth_token", newToken);
      await AsyncStorage.setItem("auth_user", JSON.stringify(user));
    } catch (e) {
      console.error("Failed to save auth state", e);
    }
  };

  const updateCurrentUser = async (user: User) => {
    try {
      setCurrentUser(user);
      await AsyncStorage.setItem("auth_user", JSON.stringify(user));
    } catch (e) {
      console.error("Failed to update auth user state", e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("auth_token");
      await AsyncStorage.removeItem("auth_user");
      setToken(null);
      setCurrentUser(null);
      router.replace("/(auth)/login");
    } catch (e) {
      console.error("Failed to clear auth state", e);
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, token, isLoading, login, logout, updateCurrentUser }}>
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