"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  api,
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
} from "./api";

export {
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser,
};

// Official role default credentials seeded by Spring Boot DataInitializer
export const ROLE_DEFAULT_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  ADMIN: { email: "vibolsen2002@gmail.com", pass: "Vibol@2020" },
  ORGANIZER: { email: "organizer@meeting.com", pass: "Organizer@2020" },
  EMPLOYEE: { email: "alice@meeting.com", pass: "Alice@2020" },
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<User>;
  logout: () => void;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<User | null>;
  ensureSession: (preferredRole?: UserRole) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync session on mount (client-side only, after hydration)
  useEffect(() => {
    const storedUser = getStoredUser();
    const storedToken = getStoredToken();
    if (storedUser) setUserState(storedUser);
    if (storedToken) setTokenState(storedToken);
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    setStoredUser(newUser);
  };

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    setStoredToken(newToken);
  };

  // Load user session on mount from token
  const refreshUser = async (): Promise<User | null> => {
    const existingToken = getStoredToken();
    if (!existingToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return null;
    }

    setToken(existingToken);
    try {
      const currentUser = await api.auth.me();
      setUser(currentUser);
      return currentUser;
    } catch {
      // If token expired or invalid, clear it
      setToken(null);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (data: LoginRequest): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.login(data);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<User> => {
    setLoading(true);
    try {
      const res = await api.auth.register(data);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    api.auth.logout();
    setToken(null);
    setUser(null);
  };

  // Ensure an authenticated session is active and matches the target workspace role
  const ensureSession = async (preferredRole: UserRole = "ADMIN"): Promise<User> => {
    const existingToken = getStoredToken();
    const existingUser = user || getStoredUser();

    if (existingToken && existingUser && existingUser.role === preferredRole) {
      if (!user) setUser(existingUser);
      return existingUser;
    }

    const creds = ROLE_DEFAULT_CREDENTIALS[preferredRole] || ROLE_DEFAULT_CREDENTIALS.ADMIN;
    return login({ email: creds.email, password: creds.pass });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        setUser,
        refreshUser,
        ensureSession,
      }}
    >
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
