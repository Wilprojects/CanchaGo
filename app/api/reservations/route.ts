import type {
  NextRequest,
} from "next/server";

import {
  apiSuccess,
} from "@/lib/http/api-response";

import {
  validateBody,
} from "@/lib/http/validate-body";

import {
  validateQuery,
} from "@/lib/http/validate-query";

import {
  withApiRoute,
} from "@/lib/http/with-api-route";

import {
  requireUser,
} from "@/modules/auth/auth.authorization";

import {
  createReservationSchema,
  listReservationsQuerySchema,
} from "@/modules/reservations/reservation.schemas";

import {
  reservationService,
} from "@/modules/reservations/reservation.service";

export const runtime =
  "nodejs";

export const GET =
  withApiRoute(
    async (
      request: NextRequest,
    ) => {
      const session =
        await requireUser(
          request,
        );

      const query =
        validateQuery(
          request,
          listReservationsQuerySchema,
        );

      const result =
        await reservationService
          .listMine(
            session.user.id,
            query,
          );

      return apiSuccess(
        result,
      );
    },
  );

export const POST =
  withApiRoute(
    async (
      request: NextRequest,
    ) => {
      const session =
        await requireUser(
          request,
        );

      const input =
        await validateBody(
          request,
          createReservationSchema,
        );

      const reservation =
        await reservationService
          .create(
            session.user.id,
            input,
          );

      return apiSuccess(
        reservation,
        201,
      );
    },
  );