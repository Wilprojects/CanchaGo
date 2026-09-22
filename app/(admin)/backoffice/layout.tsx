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
    </>
  );
}