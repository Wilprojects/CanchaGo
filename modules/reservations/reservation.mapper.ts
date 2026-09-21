import type {ReservationEntityShape, ReservationResponse,} from "@/modules/reservations/reservation.types";

export function toReservationResponse(
  reservation:
    ReservationEntityShape,
): ReservationResponse {
  return {
    id: reservation.id,

    court: {
      id: reservation.court.id,
      name: reservation.court.name,
      slug: reservation.court.slug,
      type: reservation.court.type,

      pricePerHour:
        Number(
          reservation.court.pricePerHour.toString(),
        ),
    },

    startAt: reservation.startAt.toISOString(),
    endAt: reservation.endAt.toISOString(),
    status: reservation.status,

    totalPrice:
      Number(
        reservation.totalPrice.toString(),
      ),

    expiresAt: reservation.expiresAt?.toISOString() ?? null,

    createdAt: reservation.createdAt.toISOString(),

    updatedAt: reservation.updatedAt.toISOString(),
  };
}