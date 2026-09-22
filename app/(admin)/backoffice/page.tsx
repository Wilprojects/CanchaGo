import {
  PageHeader,
} from "@/components/ui/page-header";

export const metadata = {
  title: "Administración",
};

export default function AdminDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Backoffice"
        title="Panel administrativo"
        description="Administra canchas, reservas y métricas de CanchaGo."
      />

      <div className="grid grid-4">
        <div className="card stat-card">
          <div className="stat-label">
            Canchas
          </div>

          <div className="stat-value">
            —
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Reservas
          </div>

          <div className="stat-value">
            —
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Confirmadas
          </div>

          <div className="stat-value">
            —
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Ingresos
          </div>

          <div className="stat-value">
            —
          </div>
        </div>
      </div>
    </>
  );
}