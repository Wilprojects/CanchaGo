import {
  CourtCatalog,
} from "@/features/courts/components/court-catalog";

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
        description="Explora nuestras canchas deportivas y encuentra el espacio ideal para tu próximo partido."
      />

      <CourtCatalog />
    </Container>
  );
}