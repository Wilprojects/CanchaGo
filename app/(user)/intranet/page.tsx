import {
  PageHeader,
} from "@/components/ui/page-header";

export const metadata = {
  title: "Mi cuenta",
};

export default function UserDashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mi cuenta"
        title="Hola, deportista"
        description="Consulta rápidamente el estado de tus reservas."
      />

      <div className="grid grid-3">
        <div className="card stat-card">
          <div className="stat-label">
            Próximas reservas
          </div>

          <div className="stat-value">
            —
          </div>

          <span className="muted">
            Se conectará al backend
          </span>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Total de reservas
          </div>

          <div className="stat-value">
            —
          </div>

          <span className="muted">
            Historial personal
          </span>
        </div>

        <div className="card stat-card">
          <div className="stat-label">
            Estado de sesión
          </div>

          <div className="stat-value">
            UI
          </div>

          <span className="muted">
            Autenticación en Fase 3
          </span>
        </div>
      </div>
    </>
  );
}