import type {
  NextRequest,
} from "next/server";

import {
  apiSuccess,
} from "@/lib/http/api-response";

import {
  parseRouteUuid,
} from "@/lib/http/parse-route-uuid";

import {
  withApiRoute,
} from "@/lib/http/with-api-route";

import {
  requireUser,
} from "@/modules/auth/auth.authorization";

import {
  paymentService,
} from "@/modules/payments/payment.service";

interface PaymentRouteContext {
  params: Promise<{
    quotationId:
      string;
  }>;
}

export const runtime =
  "nodejs";

export const GET =
  withApiRoute(
    async (
      request: NextRequest,
      context:
        PaymentRouteContext,
    ) => {
      const session =
        await requireUser(
          request,
        );

      const {
        quotationId:
          rawQuotationId,
      } =
        await context.params;

      const quotationId =
        parseRouteUuid(
          rawQuotationId,
        );

      const payment =
        await paymentService
          .getMine(
            session.user.id,
            quotationId,
          );

      return apiSuccess(
        payment,
      );
    },
  );