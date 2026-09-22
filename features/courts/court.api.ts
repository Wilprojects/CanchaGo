import {
  apiFetch,
} from "@/lib/api/api-client";

import type {
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