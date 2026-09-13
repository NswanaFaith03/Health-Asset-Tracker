import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { login, logout, getMe, type LoginRequest, type User } from "@workspace/api-client-react";
import { getApiBaseUrl } from "../lib/api-base-url";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize API client lazily
function initializeApiClient() {
  setBaseUrl(getApiBaseUrl());
  
  // Set auth token getter for automatic token injection
  setAuthTokenGetter(() => {
    const token = localStorage.getItem('auth_token');
    return token || null;
  });
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Initialize API client on first render
    if (!initialized) {
      initializeApiClient();
      setInitialized(true);
    }

    const loadUser = async () => {
      try {
        const currentUser = await getMe();
        setUser(currentUser);
      } catch (error) {
        // User not authenticated or error fetching user
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (initialized) {
      loadUser();
    }
  }, [initialized]);

  const loginUser = async (credentials: LoginRequest) => {
    try {
      const response = await login(credentials);
      setUser(response.user);
      localStorage.setItem('auth_token', response.token);
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('auth_token');
    }
  };

  const value = {
    user,
    isLoading,
    login: loginUser,
    logout: logoutUser,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};