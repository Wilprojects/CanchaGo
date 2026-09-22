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
  withApiRoute,
} from "@/lib/http/with-api-route";

import {
  requireUser,
} from "@/modules/auth/auth.authorization";

import {
  createPaymentSchema,
} from "@/modules/payments/payment.schemas";

import {
  paymentService,
} from "@/modules/payments/payment.service";

export const runtime =
  "nodejs";

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
          createPaymentSchema,
        );

      const result =
        await paymentService
          .startCheckout(
            {
              id:
                session
                  .user.id,

              email:
                session
                  .user.email,
            },

            input,
          );

      return apiSuccess(
        result.payment,

        result.reused
          ? 200
          : 201,
      );
    },
  );