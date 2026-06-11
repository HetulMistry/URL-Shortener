import { useState, useEffect, type ReactNode } from "react";
import type { User } from "@/types";
import { authService } from "@/services/api";
import { AuthContext } from "@/contexts/AuthContext";

const safeGetToken = (): string | null => {
  try {
    const raw = localStorage.getItem("authToken");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return raw;
  } catch {
    return null;
  }
};

const safeGetUser = (): User | null => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw || raw === "undefined" || raw === "null") return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

const safeSetToken = (token: string) => {
  try {
    if (token && token !== "undefined")
      localStorage.setItem("authToken", token);
  } catch {
    /* storage unavailable */
  }
};

const safeSetUser = (user: User) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    /* storage unavailable */
  }
};

const clearAuthStorage = () => {
  try {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  } catch {
    /* storage unavailable */
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(safeGetToken);
  const [user, setUser] = useState<User | null>(safeGetUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSession = async () => {
      const storedToken = safeGetToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const { data: envelope } = await authService.getMe();
        const freshUser = envelope.data.user;
        setUser(freshUser);
        setToken(storedToken);
        safeSetUser(freshUser);
      } catch {
        setUser(null);
        setToken(null);
        clearAuthStorage();
      } finally {
        setLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = async (email: string, password: string) => {
    const { data: envelope } = await authService.login(email, password);
    const { user: authUser, token: authToken } = envelope.data;

    setToken(authToken);
    setUser(authUser);
    safeSetToken(authToken);
    safeSetUser(authUser);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data: envelope } = await authService.register(
      name,
      email,
      password,
    );
    const { user: authUser, token: authToken } = envelope.data;

    setToken(authToken);
    setUser(authUser);
    safeSetToken(authToken);
    safeSetUser(authUser);
  };

  const logout = async () => {
    try {
      if (token) await authService.logout();
    } catch {
      /* server logout is best-effort */
    }
    setUser(null);
    setToken(null);
    clearAuthStorage();
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
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
