"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/features/auth/auth.context";

import {
  getHomeForUser,
  getPostLoginPath,
} from "@/features/auth/auth.utils";

interface LoginFormProps {
  nextPath?: string;
}

export function LoginForm({
  nextPath,
}: LoginFormProps) {
  const router =
    useRouter();

  const {
    user,
    status,
    signIn,
  } =
    useAuth();

  const [
    email,
    setEmail,
  ] =
    useState("");

  const [
    password,
    setPassword,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  useEffect(() => {
    if (
      status ===
        "authenticated" &&
      user
    ) {
      router.replace(
        getHomeForUser(
          user,
        ),
      );
    }
  }, [
    status,
    user,
    router,
  ]);

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    if (
      !email.trim() ||
      !password
    ) {
      setError(
        "Ingresa tu correo y contraseña.",
      );

      return;
    }

    try {
      setSubmitting(true);

      const loggedUser =
        await signIn({
          email:
            email
              .trim()
              .toLowerCase(),

          password,
        });

      router.replace(
        getPostLoginPath(
          loggedUser,
          nextPath,
        ),
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible iniciar sesión.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="eyebrow">
        Iniciar sesión
      </div>

      <h2 className="section-title">
        Ingresa a CanchaGo
      </h2>

      <p className="section-subtitle">
        Utiliza tu correo y
        contraseña.
      </p>

      {error && (
        <div
          className="auth-alert auth-alert-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <form
        className="auth-fields"
        onSubmit={
          handleSubmit
        }
      >
        <div className="field">
          <label htmlFor="email">
            Correo electrónico
          </label>

          <input
            id="email"
            name="email"
            type="email"
            className="input"
            autoComplete="email"
            value={email}
            disabled={
              submitting
            }
            placeholder="usuario@correo.com"
            onChange={(event) =>
              setEmail(
                event
                  .target
                  .value,
              )
            }
          />
        </div>

        <div className="field">
          <label htmlFor="password">
            Contraseña
          </label>

          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="current-password"
            value={
              password
            }
            disabled={
              submitting
            }
            placeholder="••••••••"
            onChange={(event) =>
              setPassword(
                event
                  .target
                  .value,
              )
            }
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary auth-submit"
          disabled={
            submitting
          }
        >
          {submitting
            ? "Ingresando..."
            : "Ingresar"}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes una cuenta?{" "}

        <Link
          href="/registro"
        >
          Crear cuenta
        </Link>
      </p>
    </>
  );
}