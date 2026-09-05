import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  getCurrentUser,
  getToken,
  login as loginRequest,
  register as registerRequest,
  removeToken,
  saveToken,
  googleLogin as googleLoginRequest,
  googleRegister as googleRegisterRequest,
} from "../services/auth";

// ============================================================
// TYPES
// ============================================================

type User = any;

interface AuthContextType {
  user: User | null;

  token: string | null;

  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<any>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<any>;

  googleLogin: (
    code: string
  ) => Promise<any>;

  googleRegister: (
    code: string
  ) => Promise<any>;

  logout: () => Promise<void>;

  refreshUser: () => Promise<void>;
}

// ============================================================
// CONTEXT
// ============================================================

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

// ============================================================
// PROVIDER
// ============================================================

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  // ==========================================================
  // RESTORE SESSION
  // ==========================================================

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedToken =
        await getToken();

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const currentUser =
          await getCurrentUser();

        setUser(
          currentUser?.user ??
          currentUser
        );
      } catch {
        await removeToken();

        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.log(
        "SESSION RESTORE ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  // ==========================================================
  // LOGIN
  // ==========================================================

  async function login(
    email: string,
    password: string
  ) {
    const data =
      await loginRequest(
        email,
        password
      );

    console.log(
      "LOGIN RESPONSE:",
      data
    );

    const accessToken =
      data?.access_token ??
      data?.token ??
      data?.data?.access_token ??
      data?.data?.token;

    if (!accessToken) {
      throw new Error(
        data?.message ??
        "Login succeeded but no access token was returned."
      );
    }

    await saveToken(
      accessToken
    );

    setToken(
      accessToken
    );

    const currentUser =
      await getCurrentUser();

    setUser(
      currentUser?.user ??
      currentUser
    );

    return data;
  }

  // ==========================================================
  // REGISTER
  // ==========================================================

  async function register(
    name: string,
    email: string,
    password: string
  ) {
    const data =
      await registerRequest(
        name,
        email,
        password
      );

    console.log(
      "REGISTER RESPONSE:",
      data
    );

    /*
     * Some backends automatically log
     * the user in after registration.
     */

    const accessToken =
      data?.access_token ??
      data?.token ??
      data?.data?.access_token ??
      data?.data?.token;

    if (accessToken) {
      await saveToken(
        accessToken
      );

      setToken(
        accessToken
      );

      const currentUser =
        await getCurrentUser();

      setUser(
        currentUser?.user ??
        currentUser
      );
    }

    return data;
  }

  // ==========================================================
  // GOOGLE LOGIN
  // ==========================================================

  async function googleLogin(
    code: string
  ) {
    const data =
      await googleLoginRequest(
        code
      );

    const accessToken =
      data?.access_token ??
      data?.token ??
      data?.data?.access_token ??
      data?.data?.token;

    if (!accessToken) {
      throw new Error(
        data?.message ??
        "Google login did not return an access token."
      );
    }

    await saveToken(
      accessToken
    );

    setToken(
      accessToken
    );

    const currentUser =
      await getCurrentUser();

    setUser(
      currentUser?.user ??
      currentUser
    );

    return data;
  }

  // ==========================================================
  // GOOGLE REGISTER
  // ==========================================================

  async function googleRegister(
    code: string
  ) {
    const data =
      await googleRegisterRequest(
        code
      );

    const accessToken =
      data?.access_token ??
      data?.token ??
      data?.data?.access_token ??
      data?.data?.token;

    if (!accessToken) {
      throw new Error(
        data?.message ??
        "Google registration did not return an access token."
      );
    }

    await saveToken(
      accessToken
    );

    setToken(
      accessToken
    );

    const currentUser =
      await getCurrentUser();

    setUser(
      currentUser?.user ??
      currentUser
    );

    return data;
  }

  // ==========================================================
  // LOGOUT
  // ==========================================================

  async function logout() {
    await removeToken();

    setToken(null);

    setUser(null);
  }

  // ==========================================================
  // REFRESH USER
  // ==========================================================

  async function refreshUser() {
    try {
      const currentUser =
        await getCurrentUser();

      setUser(
        currentUser?.user ??
        currentUser
      );
    } catch (error) {
      console.log(
        "REFRESH USER ERROR:",
        error
      );
    }
  }

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        googleLogin,
        googleRegister,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================
// HOOK
// ============================================================

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}