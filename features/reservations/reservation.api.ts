import {
  apiFetch,
} from "@/lib/api/api-client";

import type {
  CreateReservationInput,
  Reservation,
} from "@/features/reservations/reservation.types";

export function createReservation(
  input:
    CreateReservationInput,
) {
  return apiFetch<Reservation>(
    "/api/reservations",
    {
      method: "POST",

      body:
        JSON.stringify(
          input,
        ),
    },
  );
}