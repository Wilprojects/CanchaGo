import Link from "next/link";

import {
  ReservationList,
} from "@/features/reservations/components/reservation-list";

export const metadata = {
  title:
    "Mis reservas",
};

export default function ReservationsPage() {
  return (
    <>
      <div className="section-head">
        <div>
          <div className="eyebrow">
            Reservas
          </div>

          <h1 className="section-title">
            Mis reservas
          </h1>

          <p className="section-subtitle">
            Consulta y administra
            tus próximas reservas
            e historial.
          </p>
        </div>

        <Link
          href="/canchas"
          className="btn btn-primary"
        >
          Nueva reserva
        </Link>
      </div>

      <ReservationList />
    </>
  );
}