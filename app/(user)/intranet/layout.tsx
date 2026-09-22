import {
  Suspense,
} from "react";

import {
  DashboardShell,
} from "@/components/layout/dashboard-shell";

import {
  DashboardSidebar,
} from "@/components/layout/dashboard-sidebar";

import {
  PublicHeader,
} from "@/components/layout/public-header";

import {
  Container,
} from "@/components/ui/container";

import {
  RequireRole,
} from "@/features/auth/components/require-role";

const userNavigation = [
  {
    href: "/intranet",
    label: "Resumen",
  },
  {
    href: "/intranet/reservas",
    label: "Mis reservas",
  },
  {
    href: "/intranet/reservas/nueva",
    label: "Nueva reserva",
  },
];

interface UserLayoutProps {
  children:
    React.ReactNode;
}

export default function UserLayout({
  children,
}: UserLayoutProps) {
  return (
    <>
      <PublicHeader />

      <Suspense
        fallback={
          <div className="auth-loading">
            <div className="auth-spinner" />

            <span>
              Cargando sesión...
            </span>
          </div>
        }
      >
        <RequireRole role="USER">
          <Container className="dashboard-container">
            <DashboardShell
              sidebar={
                <DashboardSidebar
                  title="Mi CanchaGo"
                  meta="Área del usuario"
                  links={userNavigation}
                />
              }
            >
              {children}
            </DashboardShell>
          </Container>
        </RequireRole>
      </Suspense>
    </>
  );
}