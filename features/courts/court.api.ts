import {
  apiFetch,
} from "@/lib/api/api-client";

import type {
  Court,
  CourtAvailabilityData,
  CourtAvailabilityParams,
  CourtListData,
  ListCourtsParams,
} from "@/features/courts/court.types";

export async function getCourts(
  params:
    ListCourtsParams = {},

  signal?: AbortSignal,
) {
  const searchParams =
    new URLSearchParams();

  if (params.type) {
    searchParams.set(
      "type",
      params.type,
    );
  }

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  searchParams.set(
    "page",
    String(
      params.page ?? 1,
    ),
  );

  searchParams.set(
    "limit",
    String(
      params.limit ?? 9,
    ),
  );

  const queryString =
    searchParams.toString();

  return apiFetch<CourtListData>(
    `/api/courts?${queryString}`,
    {
      method:
        "GET",

      signal,
    },
  );
}

export function getCourtById(
  courtId: number,
  signal?: AbortSignal,
) {
  return apiFetch<Court>(
    `/api/courts/${courtId}`,
    {
      method: "GET",
      signal,
    },
  );
}

export function getCourtAvailability(
  params:
    CourtAvailabilityParams,

  signal?: AbortSignal,
) {
  const searchParams =
    new URLSearchParams({
      startAt:
        params.startAt,

      endAt:
        params.endAt,
    });

  if (params.type) {
    searchParams.set(
      "type",
      params.type,
    );
  }

  return apiFetch<CourtAvailabilityData>(
    `/api/courts/availability?${searchParams.toString()}`,
    {
      method: "GET",
      signal,
    },
  );
}