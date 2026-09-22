"use client";

import {
  useEffect,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "@/features/auth/auth.context";

import type {
  UserRole,
} from "@/features/auth/auth.types";

import {
  getHomeForUser,
} from "@/features/auth/auth.utils";

interface RequireRoleProps {
  role: UserRole;

  children:
    React.ReactNode;
}

export function RequireRole({
  role,
  children,
}: RequireRoleProps) {
  const router =
    useRouter();

  const pathname =
    usePathname();

  const {
    user,
    status,
  } =
    useAuth();

  useEffect(() => {
    if (
      status ===
        "unauthenticated"
    ) {
      router.replace(
        `/login?next=${encodeURIComponent(
          pathname,
        )}`,
      );

      return;
    }

    if (
      status ===
        "authenticated" &&
      user &&
      user.role !== role
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
    role,
    router,
    pathname,
  ]);

  if (
    status === "loading"
  ) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />

        <span>
          Verificando sesión...
        </span>
      </div>
    );
  }

  if (
    !user ||
    status !==
      "authenticated" ||
    user.role !== role
  ) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />

        <span>
          Redirigiendo...
        </span>
      </div>
    );
  }

  return children;
}