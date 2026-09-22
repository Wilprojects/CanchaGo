import Link from "next/link";

import type {
  Reservation,
} from "@/features/reservations/reservation.types";

import {
  COURT_TYPE_LABELS,
  formatCourtPrice,
} from "@/features/courts/court.utils";

import {
  formatReservationDateTime,
  getReservationDurationHours,
  getReservationStatusClass,
  RESERVATION_STATUS_LABELS,
} from "@/features/reservations/reservation.utils";

interface ReservationCardProps {
  reservation:
    Reservation;
}

export function ReservationCard({
  reservation,
}: ReservationCardProps) {
  const duration =
    getReservationDurationHours(
      reservation.startAt,
      reservation.endAt,
    );

  return (
    <article className="reservation-card">
      <div className="reservation-card-top">
        <div>
          <span className="court-category">
            {
              COURT_TYPE_LABELS[
                reservation
                  .court
                  .type
              ]
            }
          </span>

          <h2>
            {
              reservation
                .court
                .name
            }
          </h2>
        </div>

        <span
          className={
            `reservation-status ${
              getReservationStatusClass(
                reservation.status,
              )
            }`
          }
        >
          {
            RESERVATION_STATUS_LABELS[
              reservation.status
            ]
          }
        </span>
      </div>

      <div className="reservation-card-info">
        <div>
          <span>
            Inicio
          </span>

          <strong>
            {formatReservationDateTime(
              reservation.startAt,
            )}
          </strong>
        </div>

        <div>
          <span>
            Duración
          </span>

          <strong>
            {duration}{" "}
            {duration === 1
              ? "hora"
              : "horas"}
          </strong>
        </div>

        <div>
          <span>
            Total
          </span>

          <strong>
            {formatCourtPrice(
              reservation.totalPrice,
            )}
          </strong>
        </div>
      </div>

      {reservation.status ===
        "PENDING_PAYMENT" &&
        reservation.expiresAt && (
          <div className="reservation-hold">
            Reserva temporal hasta{" "}
            <strong>
              {formatReservationDateTime(
                reservation.expiresAt,
              )}
            </strong>
          </div>
        )}

      <div className="reservation-card-actions">
        <Link
          href={
            `/intranet/reservas/${reservation.id}`
          }
          className="btn btn-outline"
        >
          Ver detalle
        </Link>

        {reservation.status ===
          "PENDING_PAYMENT" && (
          <span className="reservation-payment-note">
            Pago pendiente
          </span>
        )}
      </div>
    </article>
  );
}