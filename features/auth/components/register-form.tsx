"use client";

import {
  useState,
} from "react";

import Link from "next/link";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/features/auth/auth.context";

export function RegisterForm() {
  const router =
    useRouter();

  const {
    signUp,
  } =
    useAuth();

  const [
    name,
    setName,
  ] =
    useState("");

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
    confirmPassword,
    setConfirmPassword,
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

  function validate() {
    if (
      name
        .trim()
        .length < 2
    ) {
      return "Ingresa un nombre válido.";
    }

    if (
      !email.includes("@")
    ) {
      return "Ingresa un correo electrónico válido.";
    }

    if (
      password.length < 8
    ) {
      return "La contraseña debe tener al menos 8 caracteres.";
    }

    if (
      password.length >
      72
    ) {
      return "La contraseña no puede superar los 72 caracteres.";
    }

    if (
      !/[a-z]/.test(
        password,
      )
    ) {
      return "La contraseña debe incluir una letra minúscula.";
    }

    if (
      !/[A-Z]/.test(
        password,
      )
    ) {
      return "La contraseña debe incluir una letra mayúscula.";
    }

    if (
      !/[0-9]/.test(
        password,
      )
    ) {
      return "La contraseña debe incluir un número.";
    }

    if (
      password !==
      confirmPassword
    ) {
      return "Las contraseñas no coinciden.";
    }

    return null;
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError(null);

    const validationError =
      validate();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

    try {
      setSubmitting(true);

      await signUp({
        name:
          name.trim(),

        email:
          email
            .trim()
            .toLowerCase(),

        password,
      });

      router.replace(
        "/intranet",
      );

      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No fue posible crear la cuenta.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="eyebrow">
        Registro
      </div>

      <h2 className="section-title">
        Crear cuenta
      </h2>

      <p className="section-subtitle">
        Completa tus datos para
        comenzar.
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
          <label htmlFor="register-name">
            Nombre
          </label>

          <input
            id="register-name"
            name="name"
            className="input"
            autoComplete="name"
            value={name}
            disabled={
              submitting
            }
            placeholder="Tu nombre"
            onChange={(event) =>
              setName(
                event
                  .target
                  .value,
              )
            }
          />
        </div>

        <div className="field">
          <label htmlFor="register-email">
            Correo electrónico
          </label>

          <input
            id="register-email"
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
          <label htmlFor="register-password">
            Contraseña
          </label>

          <input
            id="register-password"
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            minLength={8}
            maxLength={72}
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

          <span className="form-note">
            Mínimo 8 caracteres,
            con mayúscula,
            minúscula y número.
          </span>
        </div>

        <div className="field">
          <label htmlFor="confirm-password">
            Confirmar contraseña
          </label>

          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            className="input"
            autoComplete="new-password"
            value={
              confirmPassword
            }
            disabled={
              submitting
            }
            placeholder="••••••••"
            onChange={(event) =>
              setConfirmPassword(
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
            ? "Creando cuenta..."
            : "Crear cuenta"}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes cuenta?{" "}

        <Link href="/login">
          Ingresar
        </Link>
      </p>
    </>
  );
}