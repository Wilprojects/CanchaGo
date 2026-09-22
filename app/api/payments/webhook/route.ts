import type {
  NextRequest,
} from "next/server";

import {
  NextResponse,
} from "next/server";

import {
  ApiError,
} from "@/lib/http/api-error";

import {
  withApiRoute,
} from "@/lib/http/with-api-route";

import {
  validateMercadoPagoWebhook,
} from "@/modules/payments/payment.provider";

import {
  paymentService,
} from "@/modules/payments/payment.service";

interface MercadoPagoWebhookBody {
  type?: string;

  action?: string;

  data?: {
    id?:
      | string
      | number;
  };
}

export const runtime =
  "nodejs";

export const POST =
  withApiRoute(
    async (
      request: NextRequest,
    ) => {
      const dataId =
        request
          .nextUrl
          .searchParams
          .get(
            "data.id",
          );

      const isValid =
        validateMercadoPagoWebhook({
          xSignature:
            request.headers.get(
              "x-signature",
            ),

          xRequestId:
            request.headers.get(
              "x-request-id",
            ),

          dataId,
        });

      if (!isValid) {
        throw new ApiError(
          401,
          "Firma de webhook inválida.",
          "INVALID_WEBHOOK_SIGNATURE",
        );
      }

      let body:
        MercadoPagoWebhookBody =
        {};

      try {
        body =
          await request.json();
      } catch {
        body = {};
      }

      const type =
        request
          .nextUrl
          .searchParams
          .get(
            "type",
          ) ??
        body.type;

      if (
        type &&
        type !==
          "payment"
      ) {
        return NextResponse
          .json(
            {
              received:
                true,

              ignored:
                true,
            },

            {
              status:
                200,
            },
          );
      }

      const paymentId =
        dataId ??
        (
          body.data?.id !==
          undefined
            ? String(
                body
                  .data
                  .id,
              )
            : null
        );

      if (!paymentId) {
        throw new ApiError(
          400,
          "La notificación no contiene un identificador de pago.",
          "PAYMENT_ID_REQUIRED",
        );
      }

      const result =
        await paymentService
          .processWebhookPayment(
            paymentId,
          );

      return NextResponse
        .json(
          {
            received:
              true,

            ...result,
          },

          {
            status:
              200,
          },
        );
    },
  );