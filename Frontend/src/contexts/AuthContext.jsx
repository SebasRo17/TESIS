import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from "../utils/authStorage";

import {
  loginRequest,
  registerRequest,
  meRequest,
  logoutRequest,
} from "../services/authService";

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

function normalizeUser(me) {
  if (!me) return null;
  const name = me.profile ? `${me.profile.firstName} ${me.profile.lastName}`.trim() : undefined;
  return {
    id: me.id,
    email: me.email,
    status: me.status,
    profile: me.profile ?? null,
    createdAt: me.createdAt,
    name: name || me.email,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  // ===== Bootstrap: si hay token, traer /me =====
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const accessToken = getAccessToken();
        const refreshToken = getRefreshToken();

        if (!accessToken && !refreshToken) {
          if (!cancelled) {
            setUser(null);
            setStoredUser(null);
          }
          return;
        }

        // apiClient hace refresh automático si recibe 401
        const me = await meRequest();
        const normalized = normalizeUser(me);

        if (!cancelled) {
          setUser(normalized);
          setStoredUser(normalized);
        }
      } catch {
        if (!cancelled) {
          clearAuthStorage();
          setUser(null);
          setStoredUser(null);
        }
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginRequest(email, password);

      // Backend devuelve: { user, accessToken, refreshToken }
      if (!data?.accessToken || !data?.refreshToken) {
        return { ok: false, error: "Respuesta inválida del servidor" };
      }

      setTokens(data.accessToken, data.refreshToken);

      // Confirmar datos de usuario (incluye perfil)
      const me = await meRequest();
      const normalized = normalizeUser(me);
      setUser(normalized);
      setStoredUser(normalized);

      return { ok: true };
    } catch (e) {
      const msg = e?.response?.data?.error || "Credenciales inválidas";
      return { ok: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload) => {
    setIsLoading(true);
    try {
      const data = await registerRequest(payload);

      // El backend devuelve tokens, pero el usuario queda en status=pending.
      // Para evitar confusión, NO guardamos tokens; forzamos verificación email.
      return {
        ok: true,
        message:
          data?.message ||
          "Cuenta creada. Revisa tu correo para verificar tu email y luego inicia sesión.",
      };
    } catch (e) {
      const msg = e?.response?.data?.error || "No fue posible crear tu cuenta";
      return { ok: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async ({ logoutAll = false } = {}) => {
    try {
      const refreshToken = getRefreshToken();
      if (getAccessToken()) {
        await logoutRequest({ refreshToken, logoutAll });
      }
    } catch {
      // ignore
    } finally {
      clearAuthStorage();
      setUser(null);
      setStoredUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isBootstrapping,
      login,
      register,
      logout,
      setUser,
    }),
    [user, isLoading, isBootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
