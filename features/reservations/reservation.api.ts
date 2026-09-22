import {
  apiFetch,
} from "@/lib/api/api-client";

import type {
  CreateReservationInput,
  ListReservationsParams,
  Reservation,
  ReservationListData,
  UpdateReservationInput,
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

export function getReservations(
  params:
    ListReservationsParams = {},

  signal?: AbortSignal,
) {
  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "page",
    String(
      params.page ?? 1,
    ),
  );

  searchParams.set(
    "limit",
    String(
      params.limit ?? 6,
    ),
  );

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  return apiFetch<ReservationListData>(
    `/api/reservations?${searchParams.toString()}`,
    {
      method: "GET",
      signal,
    },
  );
}

export function getReservationById(
  id: number,

  signal?: AbortSignal,
) {
  return apiFetch<Reservation>(
    `/api/reservations/${id}`,
    {
      method: "GET",
      signal,
    },
  );
}

export function updateReservation(
  id: number,

  input:
    UpdateReservationInput,
) {
  return apiFetch<Reservation>(
    `/api/reservations/${id}`,
    {
      method: "PATCH",

      body:
        JSON.stringify(
          input,
        ),
    },
  );
}

export function cancelReservation(
  id: number,
) {
  return updateReservation(
    id,
    {
      action:
        "CANCEL",
    },
  );
}

export function rescheduleReservation(
  id: number,

  startAt: string,

  endAt: string,
) {
  return updateReservation(
    id,
    {
      action:
        "RESCHEDULE",

      startAt,
      endAt,
    },
  );
}