"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from "@/features/auth/auth.api";

import type {
  AuthUser,
  LoginInput,
  RegisterInput,
} from "@/features/auth/auth.types";

import {
  ApiClientError,
  isAbortError,
} from "@/lib/api/api-client";

type AuthStatus =
  | "loading"
  | "authenticated"
  | "unauthenticated";

interface AuthContextValue {
  user:
    | AuthUser
    | null;

  status:
    AuthStatus;

  signIn:
    (
      input: LoginInput,
    ) => Promise<AuthUser>;

  signUp:
    (
      input: RegisterInput,
    ) => Promise<AuthUser>;

  signOut:
    () => Promise<void>;

  refreshUser:
    () => Promise<void>;
}

const AuthContext =
  createContext<
    AuthContextValue
    | undefined
  >(undefined);

interface AuthProviderProps {
  children:
    React.ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [
    user,
    setUser,
  ] =
    useState<
      AuthUser | null
    >(null);

  const [
    status,
    setStatus,
  ] =
    useState<AuthStatus>(
      "loading",
    );

  /*
   * Carga inicial de sesión.
   *
   * El efecto inicia una operación externa
   * (consulta HTTP).
   *
   * Los cambios de estado ocurren cuando
   * la Promise se resuelve/rechaza.
   */
  useEffect(() => {
    const controller =
      new AbortController();

    getCurrentUser(
      controller.signal,
    )
      .then(
        (currentUser) => {
          if (
            controller
              .signal
              .aborted
          ) {
            return;
          }

          setUser(
            currentUser,
          );

          setStatus(
            "authenticated",
          );
        },
      )
      .catch(
        (error: unknown) => {
          if (
            isAbortError(
              error,
            ) ||
            controller
              .signal
              .aborted
          ) {
            return;
          }

          if (
            !(
              error instanceof
                ApiClientError &&
              error.statusCode ===
                401
            )
          ) {
            console.error(
              "[AUTH_SESSION_ERROR]",
              error,
            );
          }

          setUser(null);

          setStatus(
            "unauthenticated",
          );
        },
      );

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * Login.
   */
  const signIn =
    useCallback(
      async (
        input:
          LoginInput,
      ) => {
        const result =
          await loginUser(
            input,
          );

        setUser(
          result.user,
        );

        setStatus(
          "authenticated",
        );

        return result.user;
      },
      [],
    );

  /*
   * Registro + login automático.
   */
  const signUp =
    useCallback(
      async (
        input:
          RegisterInput,
      ) => {
        await registerUser(
          input,
        );

        const result =
          await loginUser({
            email:
              input.email,

            password:
              input.password,
          });

        setUser(
          result.user,
        );

        setStatus(
          "authenticated",
        );

        return result.user;
      },
      [],
    );

  /*
   * Logout.
   */
  const signOut =
    useCallback(
      async () => {
        try {
          await logoutUser();
        } finally {
          setUser(null);

          setStatus(
            "unauthenticated",
          );
        }
      },
      [],
    );

  /*
   * Permite volver a consultar manualmente
   * la sesión cuando otro componente
   * lo necesite.
   */
  const refreshUser =
    useCallback(
      async () => {
        try {
          const currentUser =
            await getCurrentUser();

          setUser(
            currentUser,
          );

          setStatus(
            "authenticated",
          );
        } catch (error) {
          if (
            isAbortError(
              error,
            )
          ) {
            return;
          }

          if (
            !(
              error instanceof
                ApiClientError &&
              error.statusCode ===
                401
            )
          ) {
            console.error(
              "[AUTH_REFRESH_ERROR]",
              error,
            );
          }

          setUser(null);

          setStatus(
            "unauthenticated",
          );
        }
      },
      [],
    );

  const value =
    useMemo(
      () => ({
        user,
        status,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }),
      [
        user,
        status,
        signIn,
        signUp,
        signOut,
        refreshUser,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider.",
    );
  }

  return context;
}