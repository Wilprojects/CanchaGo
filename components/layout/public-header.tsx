"use client";

import Link from "next/link";
import {
  usePathname,
} from "next/navigation";
import {
  useState,
} from "react";

import {
  Brand,
} from "@/components/layout/brand";

const navigation = [
  {
    href: "/",
    label: "Inicio",
  },
  {
    href: "/canchas",
    label: "Canchas",
  },
  {
    href: "/intranet/reservas",
    label: "Mis reservas",
  },
  {
    href: "/backoffice",
    label: "Administración",
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

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

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
                key={item.href}
                href={item.href}
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
              key={item.href}
              href={item.href}
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

        <Link
          href="/login"
          className="nav-link"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Ingresar
        </Link>

        <Link
          href="/registro"
          className="nav-link"
          onClick={() =>
            setMenuOpen(false)
          }
        >
          Crear cuenta
        </Link>
      </nav>
    </header>
  );
}