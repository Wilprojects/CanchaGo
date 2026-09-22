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

const adminNavigation = [
  {
    href: "/backoffice",
    label: "Dashboard",
  },
  {
    href: "/backoffice/canchas",
    label: "Canchas",
  },
  {
    href: "/backoffice/reservas",
    label: "Reservas",
  },
  {
    href: "/backoffice/analytics",
    label: "Analytics",
  },
  {
    href: "/backoffice/chat",
    label: "Asistente IA",
  },
];

interface AdminLayoutProps {
  children:
    React.ReactNode;
}

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <>
      <PublicHeader />

      <RequireRole role="ADMIN">
        <Container className="dashboard-container">
          <DashboardShell
            sidebar={
              <DashboardSidebar
                title="Administración"
                meta="Backoffice CanchaGo"
                links={
                  adminNavigation
                }
              />
            }
          >
            {children}
          </DashboardShell>
        </Container>
      </RequireRole>
    </>
  );
}