import type {
  NextRequest,
} from "next/server";

import {
  apiSuccess,
} from "@/lib/http/api-response";

import {
  parseRouteId,
} from "@/lib/http/parse-route-id";

import {
  validateBody,
} from "@/lib/http/validate-body";

import {
  withApiRoute,
} from "@/lib/http/with-api-route";

import {
  requireUser,
} from "@/modules/auth/auth.authorization";

import {
  updateReservationSchema,
} from "@/modules/reservations/reservation.schemas";

import {
  reservationService,
} from "@/modules/reservations/reservation.service";

export const runtime =
  "nodejs";

interface ReservationRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export const GET =
  withApiRoute(
    async (
      request: NextRequest,
      context:
        ReservationRouteContext,
    ) => {
      const session =
        await requireUser(
          request,
        );

      const {
        id: rawId,
      } =
        await context.params;

      const id =
        parseRouteId(
          rawId,
        );

      const reservation =
        await reservationService
          .getMineById(
            session.user.id,
            id,
          );

      return apiSuccess(
        reservation,
      );
    },
  );

export const PATCH =
  withApiRoute(
    async (
      request: NextRequest,
      context:
        ReservationRouteContext,
    ) => {
      const session =
        await requireUser(
          request,
        );

      const {
        id: rawId,
      } =
        await context.params;

      const id =
        parseRouteId(
          rawId,
        );

      const input =
        await validateBody(
          request,
          updateReservationSchema,
        );

      const reservation =
        await reservationService
          .update(
            session.user.id,
            id,
            input,
          );

      return apiSuccess(
        reservation,
      );
    },
  );