"use client";

import Link from "next/link";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  useState,
} from "react";

import {
  Brand,
} from "@/components/layout/brand";

import {
  useAuth,
} from "@/features/auth/auth.context";

const publicNavigation = [
  {
    href: "/",
    label: "Inicio",
  },

  {
    href: "/canchas",
    label: "Canchas",
  },
];

function isActivePath(
  pathname: string,
  href: string,
) {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}

export function PublicHeader() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    user,
    status,
    signOut,
  } =
    useAuth();

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);

  const navigation = [
    ...publicNavigation,

    ...(user?.role ===
    "USER"
      ? [
          {
            href:
              "/intranet/reservas",

            label:
              "Mis reservas",
          },
        ]
      : []),

    ...(user?.role ===
    "ADMIN"
      ? [
          {
            href:
              "/backoffice",

            label:
              "Administración",
          },
        ]
      : []),
  ];

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await signOut();

      setMenuOpen(false);

      router.replace("/");

      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <header className="topbar">
      <div className="nav-wrap">
        <Brand />

        <nav
          className="nav-links"
          aria-label="Navegación principal"
        >
          {navigation.map(
            (item) => (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={
                  `nav-link ${
                    isActivePath(
                      pathname,
                      item.href,
                    )
                      ? "active"
                      : ""
                  }`
                }
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="nav-actions">
          {status ===
            "unauthenticated" && (
            <>
              <Link
                href="/login"
                className="btn btn-outline btn-sm"
              >
                Ingresar
              </Link>

              <Link
                href="/registro"
                className="btn btn-primary btn-sm"
              >
                Crear cuenta
              </Link>
            </>
          )}

          {status ===
            "authenticated" &&
            user && (
              <div className="header-user">
                <Link
                  href={
                    user.role ===
                    "ADMIN"
                      ? "/backoffice"
                      : "/intranet"
                  }
                  className="user-chip"
                >
                  {user.name}
                </Link>

                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  disabled={
                    loggingOut
                  }
                  onClick={
                    handleLogout
                  }
                >
                  {loggingOut
                    ? "Saliendo..."
                    : "Cerrar sesión"}
                </button>
              </div>
            )}

          {status ===
            "loading" && (
            <span className="header-session-loading">
              Sesión...
            </span>
          )}
        </div>

        <button
          type="button"
          className="hamburger"
          aria-label="Abrir menú"
          aria-expanded={
            menuOpen
          }
          onClick={() =>
            setMenuOpen(
              (current) =>
                !current,
            )
          }
        >
          ☰
        </button>
      </div>

      <nav
        className={
          `mobile-menu ${
            menuOpen
              ? "open"
              : ""
          }`
        }
        aria-label="Navegación móvil"
      >
        {navigation.map(
          (item) => (
            <Link
              key={
                item.href
              }
              href={
                item.href
              }
              className={
                `nav-link ${
                  isActivePath(
                    pathname,
                    item.href,
                  )
                    ? "active"
                    : ""
                }`
              }
              onClick={() =>
                setMenuOpen(
                  false,
                )
              }
            >
              {item.label}
            </Link>
          ),
        )}

        {status ===
          "unauthenticated" && (
          <>
            <Link
              href="/login"
              className="nav-link"
              onClick={() =>
                setMenuOpen(
                  false,
                )
              }
            >
              Ingresar
            </Link>

            <Link
              href="/registro"
              className="nav-link"
              onClick={() =>
                setMenuOpen(
                  false,
                )
              }
            >
              Crear cuenta
            </Link>
          </>
        )}

        {status ===
          "authenticated" && (
          <button
            type="button"
            className="mobile-logout"
            onClick={
              handleLogout
            }
          >
            Cerrar sesión
          </button>
        )}
      </nav>
    </header>
  );
}