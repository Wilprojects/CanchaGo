import {
  apiFetch,
} from "@/lib/api/api-client";

import type {
  Court,
  CourtAvailabilityData,
  CourtAvailabilityParams,
  CourtListData,
  CreateCourtInput,
  ListCourtsParams,
  UpdateCourtInput,
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

  if (
    typeof params.active ===
    "boolean"
  ) {
    searchParams.set(
      "active",
      String(
        params.active,
      ),
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

export async function getAdminCourts(
  signal?: AbortSignal,
) {
  const [
    activeCourts,
    inactiveCourts,
  ] =
    await Promise.all([
      getCourts(
        {
          active:
            true,

          page:
            1,

          limit:
            100,
        },

        signal,
      ),

      getCourts(
        {
          active:
            false,

          page:
            1,

          limit:
            100,
        },

        signal,
      ),
    ]);

  return [
    ...activeCourts.items,
    ...inactiveCourts.items,
  ].sort(
    (
      first,
      second,
    ) =>
      first.name.localeCompare(
        second.name,
        "es",
      ),
  );
}

export function createCourt(
  input:
    CreateCourtInput,
) {
  return apiFetch<Court>(
    "/api/courts",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          input,
        ),
    },
  );
}

export function updateCourt(
  courtId:
    number,

  input:
    UpdateCourtInput,
) {
  return apiFetch<Court>(
    `/api/courts/${courtId}`,
    {
      method:
        "PATCH",

      body:
        JSON.stringify(
          input,
        ),
    },
  );
}

export function deactivateCourt(
  courtId:
    number,
) {
  return apiFetch<unknown>(
    `/api/courts/${courtId}`,
    {
      method:
        "DELETE",
    },
  );
}