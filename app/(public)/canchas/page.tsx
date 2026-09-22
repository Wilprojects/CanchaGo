import {
  Container,
} from "@/components/ui/container";

import {
  PageHeader,
} from "@/components/ui/page-header";

export const metadata = {
  title: "Canchas",
};

export default function CourtsPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Catálogo"
        title="Encuentra tu cancha"
        description="Explora las canchas disponibles y encuentra el espacio ideal para tu próximo partido."
      />

      <div className="placeholder">
        <strong>
          Catálogo preparado
        </strong>

        <span className="muted">
          En la Fase 2 cargaremos
          aquí las canchas reales
          mediante GET /api/courts,
          filtros y tarjetas
          reutilizables.
        </span>
      </div>
    </Container>
  );
}