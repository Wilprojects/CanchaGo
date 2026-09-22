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

      <Container className="dashboard-container">
        <DashboardShell
          sidebar={
            <DashboardSidebar
              title="Mi CanchaGo"
              meta="Área del usuario"
              links={
                userNavigation
              }
            />
          }
        >
          {children}
        </DashboardShell>
      </Container>
    </>
  );
}