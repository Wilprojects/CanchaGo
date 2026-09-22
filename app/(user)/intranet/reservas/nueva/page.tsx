import {PageHeader,} from "@/components/ui/page-header";
import Link from "next/link";
import {ReservationForm,} from "@/features/reservations/components/reservation-form";

interface NewReservationPageProps {
  searchParams: Promise<{ courtId?: string;}>;
}

export default async function NewReservationPage({
  searchParams,
}: NewReservationPageProps) {
  const params =
    await searchParams;

  const courtId =
    Number(
      params.courtId,
    );

  if (
    !Number.isInteger(
      courtId,
    ) ||
    courtId <= 0
  ) {
    return (
      <>
        <PageHeader
          eyebrow="Nueva reserva"
          title="Selecciona una cancha"
          description="Para crear una reserva primero debes seleccionar una cancha del catálogo."
        />

        <div className="catalog-state">
          <strong>
            No seleccionaste una cancha.
          </strong>

          <p>
            Regresa al catálogo y
            selecciona la cancha
            que deseas reservar.
          </p>

          <Link
            href="/canchas"
            className="btn btn-primary"
          >
            Ver canchas
          </Link>
        </div>
      </>
    );
  }

  return (
    <ReservationForm
      courtId={
        courtId
      }
    />
  );
}